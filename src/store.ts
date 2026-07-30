import type { ResponseMap } from "@core/types";
import type { CognitiveStoredResult } from "./profile";

/**
 * Client-side commerce state. No accounts, no server database: entitlements live
 * in localStorage (per device), and the in-progress result is parked in
 * sessionStorage so it survives the round-trip to Stripe Checkout.
 */

const ENT_KEY = "psyche.entitlements.v1";
const REVOCATION_KEY = "psyche.entitlement-revocations.v1";
const PENDING_KEY = "psyche.pending.v1";
const PRODUCT_IDS = new Set(["report", "cognitive", "poster", "allaccess"]);
const REVOCATION_MARKER_PATTERN = /^[a-f0-9]{40}$/;

export interface PendingResult {
  instrumentId: string;
  responses: ResponseMap;
  fingerprint: string;
  productId: string;
  /** Versioned local snapshot needed to restore standalone cognitive reports. */
  cognitive?: CognitiveStoredResult;
}

function read<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/* ── Entitlements ───────────────────────────────────────────────────────── */

export function getEntitlements(): string[] {
  const stored = read<unknown>(localStorage, ENT_KEY, []);
  return Array.isArray(stored)
    ? stored.filter((value): value is string => typeof value === "string")
    : [];
}

function writeEntitlements(entitlements: readonly string[]): boolean {
  try {
    localStorage.setItem(ENT_KEY, JSON.stringify(entitlements));
    return true;
  } catch {
    /* storage unavailable */
    return false;
  }
}

function grant(entitlement: string): boolean {
  const set = new Set(getEntitlements());
  const previousSize = set.size;
  set.add(entitlement);
  return set.size !== previousSize && writeEntitlements([...set]);
}

/** Record a successful purchase as an entitlement. */
export function grantProduct(productId: string, fingerprint: string): boolean {
  if (!PRODUCT_IDS.has(productId)) return false;
  if (productId === "allaccess") return grant("pass:allaccess");
  const reportGranted = grant(`report:${fingerprint}`);
  const posterGranted = productId === "poster"
    ? grant(`poster:${fingerprint}`)
    : false;
  return reportGranted || posterGranted;
}

/** Is the full report for this set of answers unlocked on this device? */
export function isUnlocked(fingerprint: string): boolean {
  const ents = getEntitlements();
  return ents.includes("pass:allaccess") || ents.includes(`report:${fingerprint}`);
}

export function hasPoster(fingerprint: string): boolean {
  const ents = getEntitlements();
  return ents.includes("pass:allaccess") || ents.includes(`poster:${fingerprint}`);
}

function applyConfirmedRevocation(
  fingerprint: string,
  revocationMarker: unknown,
): boolean {
  const marker =
    typeof revocationMarker === "string" &&
    REVOCATION_MARKER_PATTERN.test(revocationMarker)
      ? revocationMarker
      : null;
  const acknowledged = read<unknown>(localStorage, REVOCATION_KEY, {});
  const acknowledgements =
    acknowledged && typeof acknowledged === "object" && !Array.isArray(acknowledged)
      ? acknowledged as Record<string, unknown>
      : {};
  if (marker && acknowledgements[fingerprint] === marker) return false;

  const entitlements = getEntitlements();
  const report = `report:${fingerprint}`;
  const poster = `poster:${fingerprint}`;
  const retained = entitlements.filter(
    (entitlement) => entitlement !== report && entitlement !== poster,
  );
  const changed = retained.length !== entitlements.length;
  if (changed && !writeEntitlements(retained)) return false;

  if (marker) {
    try {
      localStorage.setItem(
        REVOCATION_KEY,
        JSON.stringify({ ...acknowledgements, [fingerprint]: marker }),
      );
    } catch {
      /* retry reconciliation on the next successful status check */
    }
  }
  return changed;
}

/* ── Pending result (survives the Stripe redirect) ──────────────────────── */

export function savePending(p: PendingResult): void {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function loadPending(): PendingResult | null {
  return read<PendingResult | null>(sessionStorage, PENDING_KEY, null);
}

export function clearPending(): void {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable */
  }
}

/* ── Checkout ───────────────────────────────────────────────────────────── */

export type CheckoutOutcome = { redirected: true } | { demo: true } | { error: string };

function localDemoEnabled(): boolean {
  if (import.meta.env.PROD) return false;
  if (import.meta.env.VITE_ENABLE_DEMO_CHECKOUT === "true") return true;
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function safeCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Start a purchase. Production fails closed when checkout is unavailable. A
 * clearly-labelled demo unlock is possible only in local development or when
 * explicitly enabled at build time.
 */
export async function startCheckout(productId: string, pending: PendingResult): Promise<CheckoutOutcome> {
  savePending(pending);
  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, fingerprint: pending.fingerprint }),
    });
    if (res.status === 404 && localDemoEnabled()) return { demo: true };
    if (!res.ok) return { error: `Checkout failed (${res.status}). Please try again.` };
    const data = (await res.json()) as { url?: unknown; devMode?: unknown };
    const checkoutUrl = safeCheckoutUrl(data.url);
    if (checkoutUrl) {
      window.location.assign(checkoutUrl);
      return { redirected: true };
    }
    if (data.devMode === true && localDemoEnabled()) return { demo: true };
    return { error: "Checkout is not configured." };
  } catch {
    return localDemoEnabled()
      ? { demo: true }
      : { error: "Checkout is temporarily unavailable. Please try again." };
  }
}

export interface VerifyResult {
  paid: boolean;
  product?: string | null;
  fp?: string | null;
  devMode?: boolean;
}

/**
 * Recover entitlements for a result from the server (set by the Stripe webhook).
 * Lets an eligible purchase recover in the same browser while its signed,
 * HttpOnly recovery authorization remains valid. No-ops without durable storage.
 * Returns true if the visible local entitlement state changed.
 */
export async function recoverEntitlements(fingerprint: string): Promise<boolean> {
  if (!fingerprint || fingerprint.length > 256) return false;
  try {
    const res = await fetch("/api/entitlement-status", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fingerprint }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      paid?: unknown;
      products?: unknown;
      revoked?: unknown;
      revocationMarker?: unknown;
    };
    let changed = false;
    if (data.revoked === true) {
      changed =
        applyConfirmedRevocation(fingerprint, data.revocationMarker) || changed;
    }
    if (data.paid && Array.isArray(data.products) && data.products.length) {
      for (const product of data.products) {
        if (typeof product === "string") {
          changed = grantProduct(product, fingerprint) || changed;
        }
      }
    }
    return changed;
  } catch {
    // Browser storage cannot receive webhook changes while offline. Preserve
    // cached access until a successful online status check confirms revocation.
  }
  return false;
}

export async function verifyCheckout(sessionId: string): Promise<VerifyResult> {
  if (!sessionId || sessionId.length > 256) return { paid: false };
  try {
    const res = await fetch("/api/verify-session", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return { paid: false };
    return (await res.json()) as VerifyResult;
  } catch {
    return { paid: false };
  }
}

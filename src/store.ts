import type { ResponseMap } from "@core/types";

/**
 * Client-side commerce state. No accounts, no server database: entitlements live
 * in localStorage (per device), and the in-progress result is parked in
 * sessionStorage so it survives the round-trip to Stripe Checkout.
 */

const ENT_KEY = "psyche.entitlements.v1";
const PENDING_KEY = "psyche.pending.v1";

export interface PendingResult {
  instrumentId: string;
  responses: ResponseMap;
  fingerprint: string;
  productId: string;
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
  return read<string[]>(localStorage, ENT_KEY, []);
}

function grant(entitlement: string): void {
  const set = new Set(getEntitlements());
  set.add(entitlement);
  localStorage.setItem(ENT_KEY, JSON.stringify([...set]));
}

/** Record a successful purchase as an entitlement. */
export function grantProduct(productId: string, fingerprint: string): void {
  if (productId === "allaccess") grant("pass:allaccess");
  else grant(`report:${fingerprint}`);
  if (productId === "poster") grant(`poster:${fingerprint}`);
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

/* ── Checkout ───────────────────────────────────────────────────────────── */

export type CheckoutOutcome = { redirected: true } | { demo: true } | { error: string };

/**
 * Start a purchase. Redirects to Stripe Checkout when configured; otherwise (no
 * Stripe key on the server, or running locally without serverless functions)
 * resolves to `{ demo: true }` so the caller can do a clearly-labeled demo unlock.
 */
export async function startCheckout(productId: string, pending: PendingResult): Promise<CheckoutOutcome> {
  savePending(pending);
  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, fingerprint: pending.fingerprint }),
    });
    if (res.status === 404) return { demo: true }; // local dev: no serverless functions
    if (!res.ok) return { error: `Checkout failed (${res.status}). Please try again.` };
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url as string;
      return { redirected: true };
    }
    if (data.devMode) return { demo: true };
    return { error: "Checkout is not configured." };
  } catch {
    return { demo: true }; // network/offline → demo unlock
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
 * Lets a purchase survive a closed tab or a second device. No-ops without KV.
 * Returns true if anything was recovered.
 */
export async function recoverEntitlements(fingerprint: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/entitlement-status?fp=${encodeURIComponent(fingerprint)}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (data.paid && Array.isArray(data.products) && data.products.length) {
      for (const p of data.products) grantProduct(p, fingerprint);
      return true;
    }
  } catch {
    /* offline or no functions — ignore */
  }
  return false;
}

export async function verifyCheckout(sessionId: string): Promise<VerifyResult> {
  try {
    const res = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`);
    if (!res.ok) return { paid: false };
    return (await res.json()) as VerifyResult;
  } catch {
    return { paid: false };
  }
}

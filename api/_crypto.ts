import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { ConfigurationError, isDemoRuntime, secretFromEnv } from "./_runtime";
import {
  exactKeys,
  fingerprintValue,
  finiteNumber,
  objectValue,
  STRIPE_SESSION_PATTERN,
  stringValue,
  type JsonObject,
} from "./_validation";

const CHECKOUT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const CHECKOUT_BINDING_MAX_AGE_SECONDS = 2 * 60 * 60;
export const RECOVERY_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface CheckoutSnapshot {
  v: 1;
  productId: string;
  fingerprint: string;
  amount: number;
  currency: "usd";
  priceRef: string;
  browserBindingHash: string;
  issuedAt: number;
  nonce: string;
}

interface RecoveryClaims {
  v: 1;
  audience: "entitlement-recovery";
  fingerprint: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

function encode(value: JsonObject): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function sign(encoded: string, secret: string, purpose: string): string {
  return createHmac("sha256", secret)
    .update(`${purpose}.${encoded}`, "utf8")
    .digest("base64url");
}

function signedToken(value: JsonObject, secret: string, purpose: string): string {
  const encoded = encode(value);
  return `${encoded}.${sign(encoded, secret, purpose)}`;
}

function verifiedPayload(token: string, secret: string, purpose: string): JsonObject {
  if (token.length > 2_048) throw new Error("invalid_token");
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error("invalid_token");
  if (
    !/^[A-Za-z0-9_-]+$/.test(parts[0]) ||
    !/^[A-Za-z0-9_-]+$/.test(parts[1]) ||
    Buffer.from(parts[0], "base64url").toString("base64url") !== parts[0] ||
    Buffer.from(parts[1], "base64url").toString("base64url") !== parts[1]
  ) {
    throw new Error("invalid_token");
  }
  const expected = Buffer.from(sign(parts[0], secret, purpose), "base64url");
  const received = Buffer.from(parts[1], "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new Error("invalid_token");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
  } catch {
    throw new Error("invalid_token");
  }
  return objectValue(parsed, "token");
}

function checkoutSecret(): string {
  return secretFromEnv("CHECKOUT_SIGNING_SECRET");
}

function browserNonceValue(value: unknown): string {
  return stringValue(value, "checkoutBinding", {
    min: 43,
    max: 43,
    pattern: /^[A-Za-z0-9_-]{43}$/,
    trim: false,
  });
}

export function createCheckoutBrowserNonce(): string {
  return randomBytes(32).toString("base64url");
}

export function checkoutBrowserBindingHash(browserNonce: string): string {
  return createHmac("sha256", checkoutSecret())
    .update("checkout-browser-binding-v1", "utf8")
    .update("\0", "utf8")
    .update(browserNonceValue(browserNonce), "utf8")
    .digest("base64url");
}

export function verifyCheckoutBrowserBinding(
  expectedHash: string,
  browserNonce: string | undefined,
): boolean {
  try {
    const expected = Buffer.from(
      stringValue(expectedHash, "browserBindingHash", {
        min: 43,
        max: 43,
        pattern: /^[A-Za-z0-9_-]{43}$/,
        trim: false,
      }),
      "base64url",
    );
    const received = Buffer.from(
      checkoutBrowserBindingHash(browserNonceValue(browserNonce)),
      "base64url",
    );
    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

export function checkoutBindingCookieName(sessionId: string): string {
  if (!STRIPE_SESSION_PATTERN.test(sessionId)) throw new Error("invalid_checkout_session");
  const suffix = createHash("sha256").update(sessionId, "utf8").digest("hex").slice(0, 24);
  return `pa_checkout_${suffix}`;
}

function recoverySecret(): string {
  const configured = process.env.RECOVERY_TOKEN_SECRET;
  if (configured) return secretFromEnv("RECOVERY_TOKEN_SECRET");
  if (!isDemoRuntime()) throw new ConfigurationError("RECOVERY_TOKEN_SECRET");

  // Local-only convenience: domain-separate a sufficiently strong checkout key.
  const base = checkoutSecret();
  return createHmac("sha256", base).update("recovery-token-v1").digest("base64url");
}

export function createCheckoutSnapshot(
  values: Omit<CheckoutSnapshot, "v" | "issuedAt" | "nonce">,
  nowSeconds = Math.floor(Date.now() / 1_000),
): string {
  const snapshot: CheckoutSnapshot = {
    v: 1,
    productId: values.productId,
    fingerprint: values.fingerprint,
    amount: values.amount,
    currency: values.currency,
    priceRef: values.priceRef,
    browserBindingHash: values.browserBindingHash,
    issuedAt: nowSeconds,
    nonce: randomBytes(16).toString("base64url"),
  };
  return signedToken(snapshot as unknown as JsonObject, checkoutSecret(), "checkout-snapshot-v1");
}

export function verifyCheckoutSnapshot(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1_000),
): CheckoutSnapshot {
  const parsed = verifiedPayload(token, checkoutSecret(), "checkout-snapshot-v1");
  exactKeys(
    parsed,
    [
      "v",
      "productId",
      "fingerprint",
      "amount",
      "currency",
      "priceRef",
      "browserBindingHash",
      "issuedAt",
      "nonce",
    ],
    [
      "v",
      "productId",
      "fingerprint",
      "amount",
      "currency",
      "priceRef",
      "browserBindingHash",
      "issuedAt",
      "nonce",
    ],
    "snapshot",
  );
  if (parsed.v !== 1 || parsed.currency !== "usd") throw new Error("invalid_snapshot");
  const issuedAt = finiteNumber(parsed.issuedAt, "snapshot.issuedAt", {
    min: nowSeconds - CHECKOUT_MAX_AGE_SECONDS,
    max: nowSeconds + 300,
    integer: true,
  });
  return {
    v: 1,
    productId: stringValue(parsed.productId, "snapshot.productId", { min: 1, max: 32 }),
    fingerprint: fingerprintValue(parsed.fingerprint, "snapshot.fingerprint"),
    amount: finiteNumber(parsed.amount, "snapshot.amount", {
      min: 50,
      max: 1_000_000,
      integer: true,
    }),
    currency: "usd",
    priceRef: stringValue(parsed.priceRef, "snapshot.priceRef", { min: 1, max: 128 }),
    browserBindingHash: stringValue(
      parsed.browserBindingHash,
      "snapshot.browserBindingHash",
      {
        min: 43,
        max: 43,
        pattern: /^[A-Za-z0-9_-]{43}$/,
        trim: false,
      },
    ),
    issuedAt,
    nonce: stringValue(parsed.nonce, "snapshot.nonce", {
      min: 16,
      max: 64,
      pattern: /^[A-Za-z0-9_-]+$/,
    }),
  };
}

export function createRecoveryToken(
  fingerprint: string,
  sessionId: string,
  nowSeconds = Math.floor(Date.now() / 1_000),
): string {
  const claims: RecoveryClaims = {
    v: 1,
    audience: "entitlement-recovery",
    fingerprint: fingerprintValue(fingerprint),
    sessionId: stringValue(sessionId, "sessionId", {
      min: 16,
      max: 255,
      pattern: STRIPE_SESSION_PATTERN,
    }),
    issuedAt: nowSeconds,
    expiresAt: nowSeconds + RECOVERY_MAX_AGE_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  return signedToken(claims as unknown as JsonObject, recoverySecret(), "recovery-token-v1");
}

export function verifyRecoveryToken(
  token: string,
  expectedFingerprint: string,
  nowSeconds = Math.floor(Date.now() / 1_000),
): boolean {
  return recoverySessionId(token, expectedFingerprint, nowSeconds) !== null;
}

export function recoverySessionId(
  token: string,
  expectedFingerprint: string,
  nowSeconds = Math.floor(Date.now() / 1_000),
): string | null {
  try {
    const parsed = verifiedPayload(token, recoverySecret(), "recovery-token-v1");
    exactKeys(
      parsed,
      ["v", "audience", "fingerprint", "sessionId", "issuedAt", "expiresAt", "nonce"],
      ["v", "audience", "fingerprint", "sessionId", "issuedAt", "expiresAt", "nonce"],
      "recovery",
    );
    if (parsed.v !== 1 || parsed.audience !== "entitlement-recovery") return null;
    const fingerprint = fingerprintValue(parsed.fingerprint, "recovery.fingerprint");
    if (fingerprint !== fingerprintValue(expectedFingerprint)) return null;
    const sessionId = stringValue(parsed.sessionId, "recovery.sessionId", {
      min: 16,
      max: 255,
      pattern: STRIPE_SESSION_PATTERN,
    });
    finiteNumber(parsed.issuedAt, "recovery.issuedAt", {
      min: nowSeconds - RECOVERY_MAX_AGE_SECONDS,
      max: nowSeconds + 300,
      integer: true,
    });
    finiteNumber(parsed.expiresAt, "recovery.expiresAt", {
      min: nowSeconds,
      max: nowSeconds + RECOVERY_MAX_AGE_SECONDS + 300,
      integer: true,
    });
    stringValue(parsed.nonce, "recovery.nonce", {
      min: 16,
      max: 64,
      pattern: /^[A-Za-z0-9_-]+$/,
    });
    return sessionId;
  } catch {
    return null;
  }
}

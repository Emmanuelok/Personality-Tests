import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkoutBrowserBindingHash,
  RECOVERY_MAX_AGE_SECONDS,
  createCheckoutSnapshot,
  createRecoveryToken,
  verifyCheckoutSnapshot,
  verifyCheckoutBrowserBinding,
  verifyRecoveryToken,
} from "../_crypto";
import {
  configuredProduct,
  productIdValue,
  verifiedCheckout,
} from "../_stripe";

const SIGNING_SECRET = "checkout-secret-that-is-at-least-thirty-two-bytes";
const RECOVERY_SECRET = "recovery-secret-that-is-at-least-thirty-two-bytes";
const BROWSER_NONCE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFG";

describe("signed checkout and recovery state", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("CHECKOUT_SIGNING_SECRET", SIGNING_SECRET);
    vi.stubEnv("RECOVERY_TOKEN_SECRET", RECOVERY_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects checkout snapshot tampering and expiration", () => {
    const token = createCheckoutSnapshot(
      {
        productId: "report",
        fingerprint: "0123456789abcd",
        amount: 189,
        currency: "usd",
        priceRef: "inline:189:usd",
        browserBindingHash: checkoutBrowserBindingHash(BROWSER_NONCE),
      },
      1_000_000,
    );
    expect(verifyCheckoutSnapshot(token, 1_000_001).productId).toBe("report");
    const snapshot = verifyCheckoutSnapshot(token, 1_000_001);
    expect(
      verifyCheckoutBrowserBinding(snapshot.browserBindingHash, BROWSER_NONCE),
    ).toBe(true);
    expect(
      verifyCheckoutBrowserBinding(
        snapshot.browserBindingHash,
        "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG",
      ),
    ).toBe(false);
    expect(() =>
      verifyCheckoutSnapshot(`${token.slice(0, -1)}x`, 1_000_001),
    ).toThrow();
    expect(() => verifyCheckoutSnapshot(token, 2_000_000)).toThrow();
  });

  it("binds recovery authorization to one fingerprint", () => {
    const token = createRecoveryToken(
      "0123456789abcd",
      "cs_test_1234567890abcdef",
      1_000_000,
    );
    expect(verifyRecoveryToken(token, "0123456789abcd", 1_000_001)).toBe(true);
    expect(
      verifyRecoveryToken(
        token,
        "0123456789abcd",
        1_000_000 + RECOVERY_MAX_AGE_SECONDS - 1,
      ),
    ).toBe(true);
    expect(
      verifyRecoveryToken(
        token,
        "0123456789abcd",
        1_000_000 + RECOVERY_MAX_AGE_SECONDS + 1,
      ),
    ).toBe(false);
    expect(verifyRecoveryToken(token, "fedcba98765432", 1_000_001)).toBe(false);
  });

  it("accepts only signed, paid Stripe sessions matching amount and result", () => {
    const issuedAt = Math.floor(Date.now() / 1_000);
    const snapshot = createCheckoutSnapshot(
      {
        productId: "report",
        fingerprint: "0123456789abcd",
        amount: 189,
        currency: "usd",
        priceRef: "inline:189:usd",
        browserBindingHash: checkoutBrowserBindingHash(BROWSER_NONCE),
      },
      issuedAt,
    );
    const session = {
      id: "cs_test_1234567890abcdef",
      mode: "payment",
      status: "complete",
      payment_status: "paid",
      currency: "usd",
      amount_subtotal: 189,
      amount_total: 189,
      created: issuedAt,
      payment_intent: "pi_1234567890abcdef",
      metadata: { checkout_snapshot: snapshot },
    } as unknown as Stripe.Checkout.Session;
    expect(verifiedCheckout(session)).toMatchObject({
      productId: "report",
      fingerprint: "0123456789abcd",
      amount: 189,
    });
    expect(verifiedCheckout({ ...session, amount_total: 188 })).toBeNull();
    expect(
      verifiedCheckout({
        ...session,
        metadata: { checkout_snapshot: `${snapshot.slice(0, -1)}x` },
      }),
    ).toBeNull();
  });

  it("hard-allowlists product IDs and validates configured cents", () => {
    expect(productIdValue("report")).toBe("report");
    expect(() => productIdValue("arbitrary")).toThrow();
    vi.stubEnv("PRICE_REPORT_CENTS", "1");
    expect(() => configuredProduct("report")).toThrow();
  });
});

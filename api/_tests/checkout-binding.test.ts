import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scoreProcessing } from "../../src/core/ability/processing";

const stripeMocks = vi.hoisted(() => ({
  createSession: vi.fn<(params: Record<string, unknown>) => Promise<Record<string, unknown>>>(),
  retrieveSession: vi.fn<(sessionId: string) => Promise<Stripe.Checkout.Session>>(),
}));

vi.mock("../_stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../_stripe")>();
  return {
    ...actual,
    getStripe: () => ({
      checkout: {
        sessions: {
          create: stripeMocks.createSession,
          retrieve: stripeMocks.retrieveSession,
        },
      },
      prices: { retrieve: vi.fn() },
    }),
  };
});

import {
  checkoutBindingCookieName,
  checkoutBrowserBindingHash,
  createCheckoutSnapshot,
  verifyCheckoutBrowserBinding,
  verifyCheckoutSnapshot,
} from "../_crypto";
import checkoutHandler from "../create-checkout-session";
import { resetMemoryRateLimitsForTests } from "../_rate-limit";
import verifyHandler from "../verify-session";
import { request, response } from "./helpers";

const SESSION_ID = "cs_test_1234567890abcdef";
const PAYMENT_INTENT_ID = "pi_1234567890abcdef";
const SIGNING_SECRET = "checkout-secret-that-is-at-least-thirty-two-bytes";
const RECOVERY_SECRET = "recovery-secret-that-is-at-least-thirty-two-bytes";
const COGNITIVE_FINGERPRINT = scoreProcessing(12, 2, 15, 90).fingerprint;

function paidSession(browserNonce: string): Stripe.Checkout.Session {
  const now = Math.floor(Date.now() / 1_000);
  const snapshot = createCheckoutSnapshot(
    {
      productId: "cognitive",
      fingerprint: COGNITIVE_FINGERPRINT,
      amount: 189,
      currency: "usd",
      priceRef: "inline:189:usd",
      browserBindingHash: checkoutBrowserBindingHash(browserNonce),
    },
    now,
  );
  return {
    id: SESSION_ID,
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    currency: "usd",
    amount_subtotal: 189,
    amount_total: 189,
    created: now,
    payment_intent: PAYMENT_INTENT_ID,
    metadata: { checkout_snapshot: snapshot },
  } as unknown as Stripe.Checkout.Session;
}

describe("checkout browser binding", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("APP_ORIGIN", "http://localhost:5173");
    vi.stubEnv("CHECKOUT_SIGNING_SECRET", SIGNING_SECRET);
    vi.stubEnv("RECOVERY_TOKEN_SECRET", RECOVERY_SECRET);
    vi.stubEnv("RATE_LIMIT_SECRET", "rate-limit-secret-that-is-at-least-thirty-two-bytes");
    delete process.env.VERCEL_ENV;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    resetMemoryRateLimitsForTests();
    stripeMocks.createSession.mockReset();
    stripeMocks.retrieveSession.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a canonical cognitive fingerprint and commits a pre-checkout cookie nonce", async () => {
    stripeMocks.createSession.mockResolvedValue({
      id: SESSION_ID,
      url: "https://checkout.stripe.com/c/pay/test-session",
    });
    const { res, captured } = response();
    await checkoutHandler(
      request({
        body: {
          productId: "cognitive",
          fingerprint: COGNITIVE_FINGERPRINT,
        },
      }),
      res,
    );

    expect(captured.statusCode).toBe(200);
    const setCookie = String(captured.headers["Set-Cookie"]);
    const [cookiePair] = setCookie.split(";");
    const separator = cookiePair.indexOf("=");
    const cookieName = cookiePair.slice(0, separator);
    const browserNonce = decodeURIComponent(cookiePair.slice(separator + 1));
    expect(cookieName).toBe(checkoutBindingCookieName(SESSION_ID));
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Path=/api/verify-session");
    expect(setCookie).toContain("Max-Age=7200");
    expect(setCookie).not.toContain("pa_recovery_");

    const params = stripeMocks.createSession.mock.calls[0][0];
    const metadata = params.metadata as Record<string, string>;
    const snapshot = verifyCheckoutSnapshot(metadata.checkout_snapshot);
    expect(COGNITIVE_FINGERPRINT).toMatch(/^rid1_[a-f0-9]{64}$/);
    expect(snapshot.fingerprint).toBe(COGNITIVE_FINGERPRINT);
    expect(
      verifyCheckoutBrowserBinding(snapshot.browserBindingHash, browserNonce),
    ).toBe(true);
  });

  it("does not treat a paid Stripe session ID as a recovery bearer token", async () => {
    const browserNonce = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFG";
    stripeMocks.retrieveSession.mockResolvedValue(paidSession(browserNonce));

    const missing = response();
    await verifyHandler(
      request({ body: { sessionId: SESSION_ID } }),
      missing.res,
    );
    expect(missing.captured.statusCode).toBe(401);
    expect(missing.captured.body).toEqual({ error: "checkout_binding_required" });
    expect(missing.captured.headers["Set-Cookie"]).toBeUndefined();

    resetMemoryRateLimitsForTests();
    const wrong = response();
    await verifyHandler(
      request({
        headers: {
          "content-type": "application/json",
          "x-vercel-forwarded-for": "203.0.113.10",
          cookie: `${checkoutBindingCookieName(SESSION_ID)}=abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG`,
        },
        body: { sessionId: SESSION_ID },
      }),
      wrong.res,
    );
    expect(wrong.captured.statusCode).toBe(401);
    expect(wrong.captured.headers["Set-Cookie"]).toBeUndefined();
  });

  it("issues recovery only for the exact browser nonce and clears the binding cookie", async () => {
    const browserNonce = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFG";
    stripeMocks.retrieveSession.mockResolvedValue(paidSession(browserNonce));
    const bindingName = checkoutBindingCookieName(SESSION_ID);
    const { res, captured } = response();
    await verifyHandler(
      request({
        headers: {
          "content-type": "application/json",
          "x-vercel-forwarded-for": "203.0.113.10",
          cookie: `${bindingName}=${browserNonce}`,
        },
        body: { sessionId: SESSION_ID },
      }),
      res,
    );

    expect(captured.statusCode).toBe(200);
    expect(captured.body).toEqual({
      paid: true,
      product: "cognitive",
      fp: COGNITIVE_FINGERPRINT,
    });
    const cookies = captured.headers["Set-Cookie"];
    expect(Array.isArray(cookies)).toBe(true);
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`pa_recovery_${COGNITIVE_FINGERPRINT}=`),
        expect.stringContaining(`${bindingName}=; Path=/api/verify-session; Max-Age=0`),
      ]),
    );
    expect((cookies as string[])[0]).toContain("Max-Age=2592000");
  });
});

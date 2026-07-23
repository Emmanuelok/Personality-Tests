import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import askHandler from "../ask";
import checkoutHandler from "../create-checkout-session";
import entitlementHandler from "../entitlement-status";
import normsHandler from "../norms";
import verifyHandler from "../verify-session";
import { SENSITIVE_INSTRUMENT_IDS } from "../../src/core/catalogPolicy";
import { resetMemoryRateLimitsForTests } from "../_rate-limit";
import { request, response } from "./helpers";

describe("API handlers", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("RATE_LIMIT_SECRET", "rate-limit-secret-that-is-at-least-thirty-two-bytes");
    delete process.env.VERCEL_ENV;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    resetMemoryRateLimitsForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets no-store/security headers and rejects unsupported methods", async () => {
    const { res, captured } = response();
    await askHandler(request({ method: "GET" }), res);
    expect(captured.statusCode).toBe(405);
    expect(captured.headers.Allow).toBe("POST");
    expect(captured.headers["Cache-Control"]).toContain("no-store");
    expect(captured.headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("validates explicit external-AI consent before returning the local fallback", async () => {
    const missingConsent = response();
    await askHandler(
      request({
        body: {
          question: "What next?",
          locale: "en",
          consent: { externalAI: false },
          actionableEvidence: ["Evidence"],
        },
      }),
      missingConsent.res,
    );
    expect(missingConsent.captured.statusCode).toBe(400);

    const fallback = response();
    await askHandler(
      request({
        body: {
          question: "What next?",
          locale: "en",
          consent: { externalAI: true },
          actionableEvidence: ["Evidence"],
        },
      }),
      fallback.res,
    );
    expect(fallback.captured.body).toEqual({ devMode: true, fallback: true });
  });

  it("allows honest demo checkout only outside production", async () => {
    const local = response();
    await checkoutHandler(
      request({
        body: { productId: "report", fingerprint: "0123456789abcd" },
      }),
      local.res,
    );
    expect(local.captured.body).toEqual({ devMode: true });

    vi.stubEnv("NODE_ENV", "production");
    resetMemoryRateLimitsForTests();
    const production = response();
    await checkoutHandler(
      request({
        body: { productId: "report", fingerprint: "0123456789abcd" },
      }),
      production.res,
    );
    expect(production.captured.statusCode).toBe(503);
    expect(production.captured.body).toEqual({ error: "service_unavailable" });
  });

  it("uses POST-only JSON contracts for session and entitlement identifiers", async () => {
    const verifyGet = response();
    await verifyHandler(request({ method: "GET" }), verifyGet.res);
    expect(verifyGet.captured.statusCode).toBe(405);

    const entitlementGet = response();
    await entitlementHandler(request({ method: "GET" }), entitlementGet.res);
    expect(entitlementGet.captured.statusCode).toBe(405);
  });

  it("rejects norms fields outside the canonical instrument catalog", async () => {
    const { res, captured } = response();
    await normsHandler(
      request({
        body: {
          instrumentId: "big-five-ipip50",
          buckets: { O: 5, C: 5, E: 5, A: 5, N: 5, injected: 5 },
        },
      }),
      res,
    );
    expect(captured.statusCode).toBe(400);
    expect(captured.body).toMatchObject({ error: "unknown_field" });
  });

  it("rejects every policy-restricted measure on norms reads and contributions", async () => {
    for (const instrumentId of SENSITIVE_INSTRUMENT_IDS) {
      const contribution = response();
      await normsHandler(
        request({
          method: "POST",
          body: { instrumentId, buckets: {} },
        }),
        contribution.res,
      );
      expect(contribution.captured.statusCode, `POST ${instrumentId}`).toBe(400);
      expect(contribution.captured.body, `POST ${instrumentId}`).toMatchObject({
        error: "norms_not_eligible",
      });

      const read = response();
      await normsHandler(
        request({
          method: "GET",
          query: { instrumentId },
        }),
        read.res,
      );
      expect(read.captured.statusCode, `GET ${instrumentId}`).toBe(400);
      expect(read.captured.body, `GET ${instrumentId}`).toMatchObject({
        error: "norms_not_eligible",
      });
    }
  });
});

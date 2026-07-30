import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRecoveryToken } from "../_crypto";
import handler from "../entitlement-status";
import { request, response } from "./helpers";

const kvMocks = vi.hoisted(() => ({
  getEntitlementRevocationMarker: vi.fn(),
  getEntitlements: vi.fn(),
}));

vi.mock("../_kv", async () => {
  const actual = await vi.importActual<typeof import("../_kv")>("../_kv");
  return {
    ...actual,
    isKvConfigured: () => true,
    getEntitlementRevocationMarker: kvMocks.getEntitlementRevocationMarker,
    getEntitlements: kvMocks.getEntitlements,
  };
});

vi.mock("../_rate-limit", () => ({
  enforceRateLimit: vi.fn(async () => true),
}));

const fingerprint = "0123456789abcd";
const sessionId = "cs_test_1234567890abcdef";
const marker = "c".repeat(40);

describe("entitlement revocation status", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv(
      "CHECKOUT_SIGNING_SECRET",
      "checkout-signing-secret-at-least-thirty-two-bytes",
    );
    kvMocks.getEntitlementRevocationMarker.mockReset();
    kvMocks.getEntitlements.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a product-free marker without recovery authorization", async () => {
    kvMocks.getEntitlementRevocationMarker.mockResolvedValue(marker);
    const { res, captured } = response();

    await handler(request({ body: { fingerprint } }), res);

    expect(captured.statusCode).toBe(200);
    expect(captured.body).toEqual({
      paid: false,
      products: [],
      revoked: true,
      revocationMarker: marker,
    });
    expect(kvMocks.getEntitlements).not.toHaveBeenCalled();
  });

  it("does not reveal product grants without recovery authorization", async () => {
    kvMocks.getEntitlementRevocationMarker.mockResolvedValue(null);
    const { res, captured } = response();

    await handler(request({ body: { fingerprint } }), res);

    expect(captured.statusCode).toBe(401);
    expect(captured.body).toEqual({
      error: "recovery_authorization_required",
    });
    expect(kvMocks.getEntitlements).not.toHaveBeenCalled();
  });

  it("returns authorized active products alongside an opaque revocation marker", async () => {
    kvMocks.getEntitlementRevocationMarker.mockResolvedValue(marker);
    kvMocks.getEntitlements.mockResolvedValue(["report"]);
    const token = createRecoveryToken(fingerprint, sessionId);
    const { res, captured } = response();

    await handler(
      request({
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
          "x-vercel-forwarded-for": "203.0.113.10",
        },
        body: { fingerprint },
      }),
      res,
    );

    expect(captured.statusCode).toBe(200);
    expect(captured.body).toEqual({
      paid: true,
      products: ["report"],
      revoked: true,
      revocationMarker: marker,
    });
    expect(kvMocks.getEntitlements).toHaveBeenCalledWith(
      fingerprint,
      [sessionId],
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  bumpNorms,
  fulfillPurchase,
  getEntitlementRevocationMarker,
  getEntitlements,
  getNorms,
  revokePayment,
} from "../_kv";

function redisResult(result: unknown): Response {
  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("Vercel KV REST adapter", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("KV_REST_API_URL", "https://redis.example.test");
    vi.stubEnv("KV_REST_API_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("submits every histogram increment in one atomic EVAL", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => redisResult(2));
    vi.stubGlobal("fetch", fetchMock);
    await expect(bumpNorms("instrument", { A: 1, B: 9 })).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const command = JSON.parse(String(options.body)) as unknown[];
    expect(command[0]).toBe("EVAL");
    expect(command).toContain("A:1");
    expect(command).toContain("B:9");
  });

  it("normalizes Redis HGETALL replies into ten-bucket histograms", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => redisResult(["A:0", "3", "A:9", "2", "bad", "x"])),
    );
    const norms = await getNorms("instrument");
    expect(norms.A).toEqual([3, 0, 0, 0, 0, 0, 0, 0, 0, 2]);
    expect(norms.bad).toBeUndefined();
  });

  it("uses atomic fulfillment and revocation scripts", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => redisResult(1));
    vi.stubGlobal("fetch", fetchMock);
    const purchase = {
      sessionId: "cs_test_1234567890abcdef",
      paymentIntentId: "pi_1234567890abcdef",
      productId: "report" as const,
      fingerprint: "0123456789abcd",
      amount: 189,
      currency: "usd" as const,
    };
    await expect(fulfillPurchase("evt_1234567890abcdef", purchase)).resolves.toBe(
      "applied",
    );
    await expect(
      revokePayment("evt_abcdef1234567890", purchase.paymentIntentId, "refund"),
    ).resolves.toBe("applied");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const call of fetchMock.mock.calls) {
      const command = JSON.parse(String((call[1] as RequestInit).body)) as unknown[];
      expect(command[0]).toBe("EVAL");
    }
    const fulfillment = JSON.parse(
      String((fetchMock.mock.calls[0][1] as RequestInit).body),
    ) as unknown[];
    expect(fulfillment[2]).toBe(6);
    expect(fulfillment[8]).toBe("pa:v2:ent-revoked:0123456789abcd");
    const revocation = JSON.parse(
      String((fetchMock.mock.calls[1][1] as RequestInit).body),
    ) as unknown[];
    expect(revocation[1]).toContain("revocationKey");
    expect(revocation).toContainEqual(expect.stringMatching(/^[a-f0-9]{40}$/));
  });

  it("reads only an opaque per-result revocation marker", async () => {
    const marker = "a".repeat(40);
    const fetchMock = vi.fn<typeof fetch>(async () => redisResult(marker));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getEntitlementRevocationMarker("0123456789abcd"),
    ).resolves.toBe(marker);
    const command = JSON.parse(
      String((fetchMock.mock.calls[0][1] as RequestInit).body),
    ) as unknown[];
    expect(command).toEqual([
      "GET",
      "pa:v2:ent-revoked:0123456789abcd",
    ]);
  });

  it("returns only active records bound to the requested fingerprint", async () => {
    const active = JSON.stringify({
      sessionId: "cs_test_1234567890abcdef",
      paymentIntentId: "pi_1234567890abcdef",
      productId: "report",
      fingerprint: "0123456789abcd",
      amount: 189,
      currency: "usd",
      status: "active",
      fulfilledAt: 1_000_000,
    });
    const wrongFingerprint = JSON.stringify({
      ...JSON.parse(active),
      sessionId: "cs_test_abcdef1234567890",
      fingerprint: "fedcba98765432",
    });
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        redisResult(["cs_test_1234567890abcdef", "cs_test_abcdef1234567890"]),
      )
      .mockResolvedValueOnce(redisResult([active, wrongFingerprint]));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getEntitlements("0123456789abcd")).resolves.toEqual(["report"]);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPending,
  getEntitlements,
  grantProduct,
  hasPoster,
  isUnlocked,
  loadPending,
  recoverEntitlements,
  savePending,
  startCheckout,
  verifyCheckout,
} from "./store";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const pending = {
  instrumentId: "big-five-ipip50",
  responses: { A1: 4 },
  fingerprint: "fp-123",
  productId: "report",
};

describe("commerce client integrity", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage());
    vi.stubGlobal("sessionStorage", new MemoryStorage());
    vi.stubGlobal("window", {
      location: {
        hostname: "psyche.example",
        assign: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("stores only the expected local entitlement keys", () => {
    grantProduct("report", "fp-123");
    expect(isUnlocked("fp-123")).toBe(true);
    expect(isUnlocked("another")).toBe(false);
    expect(getEntitlements()).toEqual(["report:fp-123"]);
  });

  it("clears pending assessment state independently of purchases", () => {
    grantProduct("report", "fp-123");
    savePending(pending);
    expect(loadPending()?.fingerprint).toBe("fp-123");
    clearPending();
    expect(loadPending()).toBeNull();
    expect(isUnlocked("fp-123")).toBe(true);
  });

  it("fails closed instead of demo-unlocking on a production-like host", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(startCheckout("report", pending)).resolves.toEqual({
      error: "Checkout is temporarily unavailable. Please try again.",
    });
  });

  it("verifies checkout with POST and keeps the session id out of the URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ paid: true, product: "report", fp: "fp-123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyCheckout("cs_test_123")).resolves.toMatchObject({ paid: true, product: "report" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/verify-session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ sessionId: "cs_test_123" }),
      }),
    );
  });

  it("requires authenticated server recovery and grants only known products", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ paid: true, products: ["report", "unknown", 42] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(recoverEntitlements("fp-123")).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/entitlement-status",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ fingerprint: "fp-123" }),
      }),
    );
    expect(isUnlocked("fp-123")).toBe(true);
    expect(getEntitlements()).toEqual(["report:fp-123"]);
  });

  it("removes matching cached report and poster grants after confirmed revocation", async () => {
    grantProduct("poster", "fp-123");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            paid: false,
            products: [],
            revoked: true,
            revocationMarker: "a".repeat(40),
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    await expect(recoverEntitlements("fp-123")).resolves.toBe(true);
    expect(isUnlocked("fp-123")).toBe(false);
    expect(hasPoster("fp-123")).toBe(false);
    expect(getEntitlements()).toEqual([]);
  });

  it("applies each opaque revocation marker once and can regrant an active product", async () => {
    grantProduct("poster", "fp-123");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          paid: true,
          products: ["report"],
          revoked: true,
          revocationMarker: "b".repeat(40),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(recoverEntitlements("fp-123")).resolves.toBe(true);
    expect(isUnlocked("fp-123")).toBe(true);
    expect(hasPoster("fp-123")).toBe(false);

    grantProduct("poster", "fp-123");
    await expect(recoverEntitlements("fp-123")).resolves.toBe(false);
    expect(hasPoster("fp-123")).toBe(true);
  });

  it("preserves cached grants while offline or when status cannot be confirmed", async () => {
    grantProduct("poster", "fp-123");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(recoverEntitlements("fp-123")).resolves.toBe(false);
    expect(isUnlocked("fp-123")).toBe(true);
    expect(hasPoster("fp-123")).toBe(true);
  });
});

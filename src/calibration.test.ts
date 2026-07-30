import { afterEach, describe, it, expect, vi } from "vitest";
import { communityPercentile, fetchNorms } from "./calibration";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("community percentile from a histogram", () => {
  const even = Array(10).fill(10); // 100 takers, uniform across buckets

  it("returns null without enough data", () => {
    expect(communityPercentile(undefined, 50)).toBeNull();
    expect(communityPercentile([1, 2, 3, 4], 50)).toBeNull(); // total < 20
  });

  it("computes a sensible percentile with half-credit within the bucket", () => {
    // value 55 → bucket 5: 50 below + half of bucket 5 (5) = 55
    expect(communityPercentile(even, 55)).toBe(55);
    // value 5 → bucket 0: 0 below + half of 10 = 5
    expect(communityPercentile(even, 5)).toBe(5);
  });

  it("clamps to the 1–99 range", () => {
    expect(communityPercentile(even, 99)).toBeLessThanOrEqual(99);
    expect(communityPercentile(even, 0)).toBeGreaterThanOrEqual(1);
  });

  it("does not fetch community norms for policy-restricted instruments", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(fetchNorms("mood-checkin")).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

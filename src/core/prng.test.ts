import { describe, expect, it } from "vitest";
import { newResultId, resultFingerprint, sha256Hex } from "./prng";

describe("canonical result fingerprints", () => {
  it("matches the SHA-256 reference vector", () => {
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("is deterministic, versioned, and API-safe", () => {
    const fingerprint = resultFingerprint("memory-span|example");
    expect(fingerprint).toMatch(/^fp1_[a-f0-9]{64}$/);
    expect(resultFingerprint("memory-span|example")).toBe(fingerprint);
    expect(resultFingerprint("memory-span|different")).not.toBe(fingerprint);
  });

  it("uses opaque random ids for new result records", () => {
    const first = newResultId();
    const second = newResultId();
    expect(first).toMatch(/^rid1_[a-f0-9]{64}$/);
    expect(second).toMatch(/^rid1_[a-f0-9]{64}$/);
    expect(second).not.toBe(first);
  });
});

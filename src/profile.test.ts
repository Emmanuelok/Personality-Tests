import { afterEach, beforeEach, describe, it, expect } from "vitest";
import {
  createProfile,
  recordResult,
  recordCognitive,
  exportEncryptedProfileCode,
  importEncryptedProfileCode,
  exportProfileCode,
  importProfileCode,
  resetProfile,
  updatePrivacy,
} from "./profile";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new MemoryStorage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new MemoryStorage() });
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
  Reflect.deleteProperty(globalThis, "sessionStorage");
});

describe("account-free profile backup codec", () => {
  it("round-trips a profile through export → import", () => {
    let p = createProfile("Riley", ["growth"]);
    p = recordResult(p, "big-five-ipip50", { A1: 5, A2: 3 }, 12345, "rid1_" + "a".repeat(64));
    p = recordCognitive(p, { id: "cognitive-ability", name: "Reasoning practice", takenAt: "2026-01-01T00:00:00.000Z", headline: "Strong accuracy in this practice session", practiceIndex: 84, chc: { Gf: 84, Gc: 70 } });

    const code = exportProfileCode(p);
    expect(code.startsWith("PA1:")).toBe(true);

    const back = importProfileCode(code);
    expect(back).not.toBeNull();
    expect(back!.name).toBe("Riley");
    expect(back!.history).toHaveLength(1);
    expect(back!.history[0].instrumentId).toBe("big-five-ipip50");
    expect(back!.cognitiveHistory?.[0].chc?.Gf).toBe(84);
  });

  it("encrypts a complete portable backup and rejects the wrong passphrase", async () => {
    let p = createProfile("Riley", ["study skills"]);
    p = recordResult(p, "big-five-ipip50", { A1: 5, A2: 3 }, 12345, "rid1_" + "b".repeat(64));
    p = recordCognitive(p, {
      id: "memory-span",
      name: "Memory practice",
      takenAt: "2026-01-01T00:00:00.000Z",
      headline: "A snapshot from this practice session",
      practiceIndex: 73,
    });

    const code = await exportEncryptedProfileCode(p, "a long local passphrase");
    expect(code.startsWith("PAE2:")).toBe(true);
    expect(code).not.toContain("Riley");
    expect(await importEncryptedProfileCode(code, "a different passphrase")).toBeNull();

    const back = await importEncryptedProfileCode(code, "a long local passphrase");
    expect(back).not.toBeNull();
    expect(back!.name).toBe("Riley");
    expect(back!.history[0].resultId).toBe("rid1_" + "b".repeat(64));
    expect(back!.cognitiveHistory?.[0].practiceIndex).toBe(73);
  });

  it("rejects malformed codes", () => {
    expect(importProfileCode("not a real code")).toBeNull();
    expect(importProfileCode("")).toBeNull();
  });

  it("normalizes missing optional arrays on import", () => {
    const code = "PA1:" + btoa(encodeURIComponent(JSON.stringify({ name: "Min", history: [] })));
    const p = importProfileCode(code);
    expect(p).not.toBeNull();
    expect(Array.isArray(p!.journal)).toBe(true);
    expect(Array.isArray(p!.cognitiveHistory)).toBe(true);
    expect(p!.privacy?.externalAI).toBe(false);
  });

  it("bounds imported fields and never treats malformed consent values as enabled", () => {
    const code = "PA1:" + btoa(encodeURIComponent(JSON.stringify({
      name: "  Min  ",
      history: [],
      focus: ["growth", 42, "growth", "x".repeat(100)],
      journal: [{ at: "not-a-date", text: " note ", mood: 99 }, { text: { unsafe: true } }],
      practiceLog: ["2026-01-01", "not-a-day"],
      streak: { last: "bad", days: 1_000_000 },
      privacy: {
        externalAI: "yes",
        contributeToNorms: 1,
        reflectiveRecommendations: true,
        updatedAt: "bad",
      },
      cognitiveHistory: [{ id: "memory-span", stored: { kind: "memory", result: { fingerprint: "bad" } } }],
      unexpected: "<script>ignored</script>",
    })));

    const p = importProfileCode(code);
    expect(p).not.toBeNull();
    expect(p!.name).toBe("Min");
    expect(p!.focus).toEqual(["growth", "x".repeat(60)]);
    expect(p!.journal).toHaveLength(1);
    expect(p!.journal[0].mood).toBe(5);
    expect(p!.practiceLog).toEqual(["2026-01-01"]);
    expect(p!.streak.days).toBe(10_000);
    expect(p!.privacy).toMatchObject({
      externalAI: false,
      contributeToNorms: false,
      reflectiveRecommendations: true,
    });
    expect(p!.cognitiveHistory?.[0].stored).toBeUndefined();
    expect("unexpected" in p!).toBe(false);
  });

  it("keeps external AI and norms off until explicitly enabled", () => {
    const p = createProfile("Min", ["growth"]);
    expect(p.privacy).toMatchObject({
      externalAI: false,
      contributeToNorms: false,
      reflectiveRecommendations: false,
    });
    const enabled = updatePrivacy(p, { externalAI: true });
    expect(enabled.privacy?.externalAI).toBe(true);
    expect(enabled.privacy?.contributeToNorms).toBe(false);
  });

  it("resets all learner, calibration, collaboration, and transient data", () => {
    localStorage.setItem("psyche.profile.v2", "{}");
    localStorage.setItem("psyche.calib.consent", "1");
    localStorage.setItem("psyche-rooms", "[]");
    localStorage.setItem("psyche-room-mem-alpha", "[]");
    localStorage.setItem("psyche-room-mem-orphan", "[]");
    localStorage.setItem("psyche-collab-profile", "{}");
    localStorage.setItem("psyche.entitlements.v1", "{\"full\":true}");
    localStorage.setItem("psyche-theme", "dark");
    sessionStorage.setItem("psyche.pending.v1", "{}");
    sessionStorage.setItem("psyche.ask-atlas.v1", "{}");

    resetProfile();

    expect(localStorage.getItem("psyche.profile.v2")).toBeNull();
    expect(localStorage.getItem("psyche.calib.consent")).toBeNull();
    expect(localStorage.getItem("psyche-rooms")).toBeNull();
    expect(localStorage.getItem("psyche-room-mem-alpha")).toBeNull();
    expect(localStorage.getItem("psyche-room-mem-orphan")).toBeNull();
    expect(localStorage.getItem("psyche-collab-profile")).toBeNull();
    expect(sessionStorage.getItem("psyche.pending.v1")).toBeNull();
    expect(sessionStorage.getItem("psyche.ask-atlas.v1")).toBeNull();
    expect(localStorage.getItem("psyche.entitlements.v1")).toBe("{\"full\":true}");
    expect(localStorage.getItem("psyche-theme")).toBe("dark");
  });
});

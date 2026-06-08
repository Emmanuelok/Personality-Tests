import { describe, it, expect } from "vitest";
import { createProfile, recordResult, recordCognitive, exportProfileCode, importProfileCode } from "./profile";

describe("account-free profile backup codec", () => {
  it("round-trips a profile through export → import", () => {
    let p = createProfile("Riley", ["growth"]);
    p = recordResult(p, "big-five-ipip50", { A1: 5, A2: 3 }, 12345);
    p = recordCognitive(p, { id: "cognitive-ability", name: "General Cognitive Ability", takenAt: "2026-01-01T00:00:00.000Z", headline: "Above-average range · 112–124", percentile: 84, chc: { Gf: 84, Gc: 70 } });

    const code = exportProfileCode(p);
    expect(code.startsWith("PA1:")).toBe(true);

    const back = importProfileCode(code);
    expect(back).not.toBeNull();
    expect(back!.name).toBe("Riley");
    expect(back!.history).toHaveLength(1);
    expect(back!.history[0].instrumentId).toBe("big-five-ipip50");
    expect(back!.cognitiveHistory?.[0].chc?.Gf).toBe(84);
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
  });
});

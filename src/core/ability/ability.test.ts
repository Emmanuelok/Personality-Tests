import { describe, it, expect } from "vitest";
import { ABILITY_TESTS, scoreAbility } from "./index";
import { makeDigits, makeSequence, scoreMemory, scoreCorsi, type MemoryTrial } from "./memory";
import { makeSpeedTrial, scoreProcessing } from "./processing";
import { chcFromDomains, buildBattery } from "./chc";
import { genItem, scoreAdaptive, type AdaptiveTrial } from "./adaptive";
import type { AbilityResponses } from "./types";

describe("ability tests are well-formed", () => {
  for (const test of ABILITY_TESTS) {
    it(`${test.id}: items, options, and answer keys are valid`, () => {
      const ids = new Set(test.items.map((i) => i.id));
      expect(ids.size).toBe(test.items.length); // unique ids
      const domainIds = new Set(test.domains.map((d) => d.id));
      for (const it of test.items) {
        expect(domainIds.has(it.domain)).toBe(true);
        expect(it.options.length).toBeGreaterThanOrEqual(2);
        expect(it.answer).toBeGreaterThanOrEqual(0);
        expect(it.answer).toBeLessThan(it.options.length);
        expect(it.pCorrect).toBeGreaterThan(0);
        expect(it.pCorrect).toBeLessThan(1);
        if (it.optionFigures) expect(it.optionFigures.length).toBe(it.options.length);
      }
      // every domain has at least one item
      for (const d of test.domains) {
        expect(test.items.some((i) => i.domain === d.id)).toBe(true);
      }
    });
  }
});

describe("ability scoring", () => {
  const test = ABILITY_TESTS[0];
  const allCorrect: AbilityResponses = Object.fromEntries(test.items.map((i) => [i.id, i.answer]));
  const allWrong: AbilityResponses = Object.fromEntries(
    test.items.map((i) => [i.id, (i.answer + 1) % i.options.length]),
  );

  it("scores a perfect set at the top of the range", () => {
    const r = scoreAbility(test, allCorrect);
    expect(r.correct).toBe(test.items.length);
    expect(r.percentile).toBeGreaterThanOrEqual(90);
    expect(r.iqHigh).toBeGreaterThan(r.iqLow);
    expect(r.iqLow).toBeGreaterThan(115);
  });

  it("scores an all-wrong set at the bottom", () => {
    const r = scoreAbility(test, allWrong);
    expect(r.correct).toBe(0);
    expect(r.percentile).toBeLessThanOrEqual(10);
    expect(r.iqHigh).toBeLessThan(90);
  });

  it("per-domain correct counts sum to the overall correct count", () => {
    const r = scoreAbility(test, allCorrect);
    const sum = r.perDomain.reduce((s, d) => s + d.correct, 0);
    expect(sum).toBe(r.correct);
    const totals = r.perDomain.reduce((s, d) => s + d.total, 0);
    expect(totals).toBe(r.total);
  });

  it("produces a stable fingerprint for identical responses", () => {
    expect(scoreAbility(test, allCorrect).fingerprint).toBe(scoreAbility(test, allCorrect).fingerprint);
  });
});

describe("working-memory scoring", () => {
  it("makeDigits returns a string of the requested length using digits 1-9", () => {
    const s = makeDigits(6);
    expect(s).toHaveLength(6);
    expect(/^[1-9]+$/.test(s)).toBe(true);
  });

  it("reports the longest correct span per mode and a high band when strong", () => {
    const trials: MemoryTrial[] = [
      { mode: "forward", span: 5, shown: "12345", entered: "12345", correct: true },
      { mode: "forward", span: 8, shown: "12345678", entered: "12345678", correct: true },
      { mode: "backward", span: 6, shown: "123456", entered: "654321", correct: true },
    ];
    const r = scoreMemory(trials);
    expect(r.maxForward).toBe(8);
    expect(r.maxBackward).toBe(6);
    expect(r.percentile).toBeGreaterThan(80);
  });

  it("scores all-incorrect at the bottom", () => {
    const trials: MemoryTrial[] = [
      { mode: "forward", span: 3, shown: "123", entered: "", correct: false },
      { mode: "backward", span: 3, shown: "123", entered: "", correct: false },
    ];
    const r = scoreMemory(trials);
    expect(r.maxForward).toBe(0);
    expect(r.maxBackward).toBe(0);
    expect(r.percentile).toBeLessThan(15);
  });
});

describe("Corsi spatial span", () => {
  it("makeSequence returns distinct indices of the requested length", () => {
    const seq = makeSequence(5, 9);
    expect(seq).toHaveLength(5);
    expect(new Set(seq).size).toBe(5);
    expect(seq.every((n) => n >= 0 && n < 9)).toBe(true);
  });

  it("scores spatial span and reports the longest correct path", () => {
    const trials: MemoryTrial[] = [
      { mode: "forward", span: 4, shown: "0-1-2-3", entered: "0-1-2-3", correct: true },
      { mode: "forward", span: 6, shown: "0-1-2-3-4-5", entered: "0-1-2-3-4-5", correct: true },
      { mode: "backward", span: 5, shown: "0-1-2-3-4", entered: "4-3-2-1-0", correct: true },
    ];
    const r = scoreCorsi(trials);
    expect(r.maxForward).toBe(6);
    expect(r.maxBackward).toBe(5);
    expect(r.percentile).toBeGreaterThan(50);
  });
});

describe("processing speed", () => {
  it("builds trials whose 'present' flag matches the search set", () => {
    for (let i = 0; i < 50; i++) {
      const t = makeSpeedTrial();
      expect(t.targets.length).toBe(2);
      expect(t.search.length).toBe(5);
      const anyTarget = t.search.some((s) => t.targets.includes(s));
      expect(anyTarget).toBe(t.present);
    }
  });

  it("rewards fast, accurate work and penalizes errors", () => {
    const fast = scoreProcessing(50, 1, 51, 90);
    const slow = scoreProcessing(8, 6, 14, 90);
    expect(fast.percentile).toBeGreaterThan(slow.percentile);
    expect(fast.percentile).toBeGreaterThan(80);
    expect(slow.percentile).toBeLessThan(30);
  });
});

describe("CHC battery aggregation", () => {
  it("maps domains onto CHC factors", () => {
    const chc = chcFromDomains([
      { domain: "verbal", percentile: 80 },
      { domain: "abstract", percentile: 60 },
      { domain: "numerical", percentile: 70 },
      { domain: "spatial", percentile: 50 },
    ]);
    expect(chc).toEqual({ Gc: 80, Gf: 60, Gq: 70, Gv: 50 });
  });

  it("builds a battery, averaging per factor and overall, ignoring empty takes", () => {
    const b = buildBattery([{ chc: { Gf: 80, Gc: 70 } }, { chc: { Gv: 60 } }, { chc: {} }, {}]);
    expect(b).not.toBeNull();
    expect(b!.tests).toBe(2);
    expect(b!.factors.map((f) => f.id).sort()).toEqual(["Gc", "Gf", "Gv"]);
    expect(b!.overall).toBe(70);
    expect(b!.iqHigh).toBeGreaterThan(b!.iqLow);
  });

  it("returns null with no CHC data", () => {
    expect(buildBattery([{}, { chc: {} }])).toBeNull();
  });
});

describe("adaptive reasoning", () => {
  it("generates well-formed items at every difficulty level", () => {
    for (let level = 1; level <= 7; level++) {
      for (let k = 0; k < 8; k++) {
        const it = genItem(level);
        expect(it.options.length).toBe(6);
        expect(it.optionFigures.length).toBe(6);
        expect(it.answer).toBeGreaterThanOrEqual(0);
        expect(it.answer).toBeLessThan(6);
        expect(it.figure.length).toBeGreaterThan(20);
        // the correct option's figure must be unique (distractors differ from the key)
        const key = it.optionFigures[it.answer];
        expect(it.optionFigures.filter((f) => f === key).length).toBe(1);
      }
    }
  });

  it("estimates higher ability when the staircase settles high", () => {
    const high: AdaptiveTrial[] = Array.from({ length: 16 }, () => ({ level: 6, correct: true }));
    const low: AdaptiveTrial[] = Array.from({ length: 16 }, () => ({ level: 1, correct: false }));
    expect(scoreAdaptive(high).percentile).toBeGreaterThan(scoreAdaptive(low).percentile);
    expect(scoreAdaptive(high).percentile).toBeGreaterThan(60);
    expect(scoreAdaptive(low).percentile).toBeLessThan(20);
  });
});

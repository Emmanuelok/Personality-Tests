import { describe, it, expect } from "vitest";
import { ABILITY_TESTS, scoreAbility } from "./index";
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

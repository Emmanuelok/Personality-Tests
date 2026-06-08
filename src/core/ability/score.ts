import { cyrb53 } from "../prng";
import type { AbilityTest, AbilityResponses, AbilityResult, DomainScore, AbilityItem } from "./types";

/** Standard normal CDF via an Abramowitz-Stegun erf approximation. */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  let p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  p = 1 - p;
  return z >= 0 ? p : 1 - p;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Convert a set of items + correct count into an estimated percentile and z. */
function estimate(items: AbilityItem[], correct: number): { percentile: number; z: number } {
  const mean = items.reduce((s, it) => s + it.pCorrect, 0);
  const variance = items.reduce((s, it) => s + it.pCorrect * (1 - it.pCorrect), 0);
  const sd = Math.sqrt(Math.max(variance, 0.5));
  const z = (correct - mean) / sd;
  const percentile = clamp(Math.round(normalCdf(z) * 100), 1, 99);
  return { percentile, z };
}

function band(iqMid: number): string {
  if (iqMid >= 125) return "Very high range";
  if (iqMid >= 110) return "Above-average range";
  if (iqMid >= 90) return "Average range";
  if (iqMid >= 75) return "Below-average range";
  return "Well-below-average range";
}

export function scoreAbility(test: AbilityTest, responses: AbilityResponses): AbilityResult {
  const isCorrect = (it: AbilityItem) => responses[it.id] === it.answer;

  const perDomain: DomainScore[] = test.domains.map((d) => {
    const items = test.items.filter((it) => it.domain === d.id);
    const correct = items.filter(isCorrect).length;
    const { percentile } = estimate(items, correct);
    return {
      domain: d.id,
      name: d.name,
      correct,
      total: items.length,
      pct: items.length ? Math.round((correct / items.length) * 100) : 0,
      percentile,
    };
  });

  const correct = test.items.filter(isCorrect).length;
  const total = test.items.length;
  const { percentile, z } = estimate(test.items, correct);
  const iqMid = clamp(Math.round(100 + 15 * z), 55, 145);
  const iqLow = clamp(iqMid - 6, 50, 150);
  const iqHigh = clamp(iqMid + 6, 50, 150);

  const fp = cyrb53(
    test.id + "|" + Object.keys(responses).sort().map((k) => `${k}:${responses[k]}`).join(","),
  ).toString(36);

  return { testId: test.id, responses, correct, total, perDomain, percentile, iqLow, iqHigh, band: band(iqMid), fingerprint: fp };
}

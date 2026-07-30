/**
 * Cattell-Horn-Carroll (CHC) aggregation — merges results from every cognitive
 * test the user has taken into a single broad-ability profile. Each test (and each
 * of its domains) maps onto a CHC broad ability; we average task-specific
 * practice indices that land on each factor to build one cross-test observation.
 * This is a study aid, not a rank or a claim about fixed potential.
 */

import { practiceObservation } from "./score";

export interface ChcFactor { id: string; name: string; blurb: string }

export const CHC: ChcFactor[] = [
  { id: "Gf", name: "Fluid Reasoning", blurb: "Novel problem-solving and pattern logic." },
  { id: "Gc", name: "Verbal / Crystallized", blurb: "Acquired knowledge and language reasoning." },
  { id: "Gv", name: "Visual-Spatial", blurb: "Mentally manipulating shapes and space." },
  { id: "Gsm", name: "Working Memory", blurb: "Holding and juggling information in mind." },
  { id: "Gs", name: "Processing Speed", blurb: "Quick, accurate simple decisions." },
  { id: "Gq", name: "Quantitative", blurb: "Reasoning with numbers and quantity." },
];

const CHC_BY_ID = new Map(CHC.map((c) => [c.id, c]));

/** Map each test domain id onto its CHC broad ability. */
const DOMAIN_CHC: Record<string, string> = {
  verbal: "Gc",
  numerical: "Gq",
  abstract: "Gf",
  spatial: "Gv",
  matrices: "Gf",
  series: "Gf",
  rotation: "Gv",
  classification: "Gf",
  logic: "Gf",
  // critical thinking
  deduction: "Gf",
  inference: "Gf",
  assumptions: "Gf",
  fallacy: "Gc",
  // mechanical reasoning
  levers: "Gv",
  gears: "Gv",
  fluids: "Gv",
};

/** Build a CHC contribution map from per-domain practice indices. */
export function chcFromDomains(perDomain: { domain: string; practiceIndex: number }[]): Record<string, number> {
  const acc: Record<string, number[]> = {};
  for (const d of perDomain) {
    const f = DOMAIN_CHC[d.domain];
    if (!f) continue;
    (acc[f] ??= []).push(d.practiceIndex);
  }
  const out: Record<string, number> = {};
  for (const f of Object.keys(acc)) out[f] = Math.round(acc[f].reduce((a, b) => a + b, 0) / acc[f].length);
  return out;
}

export interface BatteryFactor extends ChcFactor { practiceIndex: number; n: number }
export interface Battery {
  factors: BatteryFactor[];
  /** Mean task-specific practice index across measured factors. */
  practiceIndex: number;
  observation: string;
  /** How many tests contributed. */
  tests: number;
}

/** Aggregate the CHC contributions stored on cognitive takes into one battery profile. */
export function buildBattery(takes: { chc?: Record<string, number> }[]): Battery | null {
  const acc: Record<string, number[]> = {};
  let contributing = 0;
  for (const t of takes) {
    if (!t.chc || Object.keys(t.chc).length === 0) continue;
    contributing++;
    for (const f of Object.keys(t.chc)) (acc[f] ??= []).push(t.chc[f]);
  }
  const factors: BatteryFactor[] = CHC.filter((c) => acc[c.id]?.length).map((c) => ({
    ...c,
    practiceIndex: Math.round(acc[c.id].reduce((a, b) => a + b, 0) / acc[c.id].length),
    n: acc[c.id].length,
  }));
  if (!factors.length) return null;
  const practiceIndex = Math.round(
    factors.reduce((sum, factor) => sum + factor.practiceIndex, 0) / factors.length,
  );
  return {
    factors,
    practiceIndex,
    observation: practiceObservation(practiceIndex),
    tests: contributing,
  };
}

export { CHC_BY_ID };

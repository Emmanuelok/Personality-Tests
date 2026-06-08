/**
 * Cattell-Horn-Carroll (CHC) aggregation — merges results from every cognitive
 * test the user has taken into a single broad-ability profile. Each test (and each
 * of its domains) maps onto a CHC broad ability; we average the percentiles that
 * land on each factor to build one cross-test portrait and an overall estimate.
 */

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
};

/** Build a CHC contribution map from an ability test's per-domain percentiles. */
export function chcFromDomains(perDomain: { domain: string; percentile: number }[]): Record<string, number> {
  const acc: Record<string, number[]> = {};
  for (const d of perDomain) {
    const f = DOMAIN_CHC[d.domain];
    if (!f) continue;
    (acc[f] ??= []).push(d.percentile);
  }
  const out: Record<string, number> = {};
  for (const f of Object.keys(acc)) out[f] = Math.round(acc[f].reduce((a, b) => a + b, 0) / acc[f].length);
  return out;
}

export function chcBand(percentile: number): string {
  if (percentile >= 91) return "Very high range";
  if (percentile >= 75) return "Above-average range";
  if (percentile >= 25) return "Average range";
  if (percentile >= 9) return "Below-average range";
  return "Well-below-average range";
}

export interface BatteryFactor extends ChcFactor { percentile: number; n: number }
export interface Battery {
  factors: BatteryFactor[];
  /** Mean of the measured factors (a rough overall estimate). */
  overall: number;
  band: string;
  /** How many tests contributed. */
  tests: number;
  /** Estimated IQ-equivalent range from the overall percentile. */
  iqLow: number;
  iqHigh: number;
}

// Inverse normal (for percentile → z), rational approximation (Beasley-Springer/Moro).
function probit(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q: number, r: number;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p <= 1 - pl) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
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
    percentile: Math.round(acc[c.id].reduce((a, b) => a + b, 0) / acc[c.id].length),
    n: acc[c.id].length,
  }));
  if (!factors.length) return null;
  const overall = Math.round(factors.reduce((s, f) => s + f.percentile, 0) / factors.length);
  const z = probit(Math.min(0.99, Math.max(0.01, overall / 100)));
  const iqMid = Math.max(55, Math.min(145, Math.round(100 + 15 * z)));
  return { factors, overall, band: chcBand(overall), tests: contributing, iqLow: Math.max(50, iqMid - 6), iqHigh: Math.min(150, iqMid + 6) };
}

export { CHC_BY_ID };

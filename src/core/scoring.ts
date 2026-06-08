import type {
  AssessmentResult,
  FacetScore,
  Instrument,
  Level,
  ResponseMap,
  ScaleScore,
} from "./types";
import { hashHex } from "./prng";
import { clamp } from "./variation";

/** Abramowitz & Stegun 7.1.26 approximation of the error function. */
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

/** Standard normal CDF for value `x` under N(mean, sd). */
function normalCdf(x: number, mean: number, sd: number): number {
  if (sd <= 0) return x >= mean ? 1 : 0;
  return 0.5 * (1 + erf((x - mean) / (sd * Math.SQRT2)));
}

function levelFromPercentile(p: number): Level {
  if (p < 10) return "very low";
  if (p < 30) return "low";
  if (p <= 70) return "moderate";
  if (p <= 90) return "high";
  return "very high";
}

/** Apply keying so that a high keyed value always means "more of the scale's high pole." */
function keyedValue(raw: number, keyed: 1 | -1, min: number, max: number): number {
  return keyed === 1 ? raw : min + max - raw;
}

/**
 * Score a completed (or partially completed) assessment into continuous scale
 * scores, percentiles, levels, optional facets, and — for typological
 * instruments — a resolved type. Missing responses are simply omitted from the
 * means rather than imputed.
 */
export function scoreAssessment(instrument: Instrument, responses: ResponseMap): AssessmentResult {
  const { min, max } = instrument.responseFormat;
  const midpoint = (min + max) / 2;

  const scales: Record<string, ScaleScore> = {};

  for (const scale of instrument.scales) {
    const scaleItems = instrument.items.filter((i) => i.scale === scale.id);

    let sum = 0;
    let count = 0;
    const facetAgg: Record<string, { sum: number; count: number }> = {};

    for (const item of scaleItems) {
      const r = responses[item.id];
      if (r == null || Number.isNaN(r)) continue;
      const kv = keyedValue(r, item.keyed, min, max);
      sum += kv;
      count += 1;
      if (item.facet) {
        (facetAgg[item.facet] ??= { sum: 0, count: 0 });
        facetAgg[item.facet].sum += kv;
        facetAgg[item.facet].count += 1;
      }
    }

    const mean = count > 0 ? sum / count : midpoint;
    const normalized = clamp(((mean - min) / (max - min)) * 100, 0, 100);
    const percentile =
      scale.normMean != null && scale.normSd != null
        ? clamp(normalCdf(mean, scale.normMean, scale.normSd) * 100, 0.5, 99.5)
        : normalized;

    const facets: Record<string, FacetScore> = {};
    if (scale.facets) {
      for (const f of scale.facets) {
        const agg = facetAgg[f.id];
        const fmean = agg && agg.count > 0 ? agg.sum / agg.count : midpoint;
        const fnorm = clamp(((fmean - min) / (max - min)) * 100, 0, 100);
        facets[f.id] = {
          facetId: f.id,
          name: f.name,
          mean: fmean,
          normalized: fnorm,
          level: levelFromPercentile(fnorm),
          itemCount: agg?.count ?? 0,
        };
      }
    }

    scales[scale.id] = {
      scaleId: scale.id,
      name: scale.name,
      raw: sum,
      mean,
      normalized,
      percentile,
      level: levelFromPercentile(percentile),
      itemCount: count,
      facets,
    };
  }

  const type = instrument.resolveType ? instrument.resolveType(scales) : undefined;

  // Fingerprint identifies the *answers*: stable across regenerations of a report.
  const canonical = Object.keys(responses)
    .sort()
    .map((k) => `${k}=${responses[k]}`)
    .join("|");
  const responseFingerprint = hashHex(`${instrument.id}::${canonical}`);

  return {
    instrumentId: instrument.id,
    takenAt: new Date().toISOString(),
    responses,
    scales,
    type,
    responseFingerprint,
  };
}

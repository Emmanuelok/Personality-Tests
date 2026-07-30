import type {
  AssessmentResult,
  FacetScore,
  Instrument,
  Level,
  ResponseMap,
  ScaleDef,
  ScaleScore,
  ScaleStanding,
} from "./types";
import { newResultId } from "./prng";
import { clamp } from "./variation";
import {
  submitTimedAttempt,
  type SubmissionPolicy,
  type SubmissionReceipt,
  type SubmissionRequest,
  type TimedAttempt,
} from "./timing";

export interface ScoreAssessmentOptions {
  /** Injected for deterministic tests/replays; defaults to the current wall clock. */
  takenAt?: string | Date;
  /** Persisted opaque id for restoring an existing result without changing access. */
  resultId?: string;
}

const takenAtIso = (value?: string | Date): string => {
  if (value == null) return new Date().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("takenAt must be a valid date.");
  return date.toISOString();
};

function levelFromStandingValue(value: number): Level {
  if (value < 10) return "very low";
  if (value < 30) return "low";
  if (value <= 70) return "moderate";
  if (value <= 90) return "high";
  return "very high";
}

export function responseRangePosition(score: ScaleScore): number {
  return score.normalized;
}

/**
 * Resolve current and legacy persisted scores into the only supported local
 * standing: position within the instrument's response range. Older percentile-
 * shaped fields and approximate norm metadata are deliberately ignored because
 * they do not carry population, sample, locale, age, or version provenance.
 */
export function resolveScaleStanding(
  score: {
    normalized: number;
    percentile?: number;
    standing?: unknown;
  },
  _scale?: Pick<ScaleDef, "normMean" | "normSd">,
  _format: Instrument["format"] = "likert",
): ScaleStanding {
  const position = clamp(score.normalized, 0, 100);
  return {
    kind: "response-range",
    value: position,
    position,
    basis: "instrument-response-range",
  };
}

/** Apply keying so that a high keyed value always means "more of the scale's high pole." */
function keyedValue(raw: number, keyed: 1 | -1, min: number, max: number): number {
  return keyed === 1 ? raw : min + max - raw;
}

/**
 * Score a multiple-choice (single-select) instrument. Two shapes are supported, detected
 * per scale from the option keying:
 *  • Categorical (VARK, Love Languages, conflict style): every option is its own scale and
 *    keyed +1, so a scale's standing is its share of all choices (votes / total).
 *  • Forced-choice bipolar (Keirsey, Kolb): two options share a scale with opposite keying,
 *    so the scale's standing is the proportion of high-pole picks, p / (p + n).
 * The dominant channel/type or the axis position then falls out naturally.
 */
function scoreChoice(
  instrument: Instrument,
  responses: ResponseMap,
  options: ScoreAssessmentOptions,
): AssessmentResult {
  const choiceItems = instrument.items.filter((i) => i.options && i.options.length);
  // A scale is bipolar if any of its options is keyed to the low pole.
  const bipolar: Record<string, boolean> = {};
  for (const item of choiceItems) for (const o of item.options!) if ((o.keyed ?? 1) === -1) bipolar[o.scale] = true;

  let total = 0;
  const pos: Record<string, number> = {};
  const neg: Record<string, number> = {};
  for (const item of choiceItems) {
    const r = responses[item.id];
    if (r == null || Number.isNaN(r)) continue;
    const opt = item.options![r];
    if (!opt) continue;
    total += 1;
    if ((opt.keyed ?? 1) === -1) neg[opt.scale] = (neg[opt.scale] ?? 0) + 1;
    else pos[opt.scale] = (pos[opt.scale] ?? 0) + 1;
  }

  const scales: Record<string, ScaleScore> = {};
  for (const scale of instrument.scales) {
    const p = pos[scale.id] ?? 0;
    const n = neg[scale.id] ?? 0;
    const normalized = bipolar[scale.id]
      ? clamp(p + n > 0 ? (p / (p + n)) * 100 : 50, 0, 100) // axis position toward the high pole
      : clamp(total > 0 ? (p / total) * 100 : 0, 0, 100); // share of all choices
    const standing: ScaleStanding = {
      kind: "response-range",
      value: normalized,
      position: normalized,
      basis: "instrument-response-range",
    };
    scales[scale.id] = {
      scaleId: scale.id,
      name: scale.name,
      raw: p + n,
      mean: normalized,
      normalized,
      standing,
      level: levelFromStandingValue(normalized),
      itemCount: p + n,
      facets: {},
    };
  }

  const type = instrument.resolveType ? instrument.resolveType(scales) : undefined;
  const canonical = Object.keys(responses)
    .sort()
    .map((k) => `${k}=${responses[k]}`)
    .join("|");
  void canonical;
  const responseFingerprint = options.resultId ?? newResultId();
  return {
    instrumentId: instrument.id,
    takenAt: takenAtIso(options.takenAt),
    responses,
    scales,
    type,
    responseFingerprint,
  };
}

/**
 * Score a completed (or partially completed) assessment into continuous scale
 * scores, response-range standing, levels, optional facets, and — for
 * typological instruments — a resolved type. Local scoring makes no population
 * rank claim. Missing responses are simply omitted from the means rather than
 * imputed.
 */
export function scoreAssessment(
  instrument: Instrument,
  responses: ResponseMap,
  options: ScoreAssessmentOptions = {},
): AssessmentResult {
  if (instrument.format === "choice") return scoreChoice(instrument, responses, options);
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
    const standing: ScaleStanding = {
      kind: "response-range",
      value: normalized,
      position: normalized,
      basis: "instrument-response-range",
    };

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
          level: levelFromStandingValue(fnorm),
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
      standing,
      level: levelFromStandingValue(normalized),
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
  void canonical;
  const responseFingerprint = options.resultId ?? newResultId();

  return {
    instrumentId: instrument.id,
    takenAt: takenAtIso(options.takenAt),
    responses,
    scales,
    type,
    responseFingerprint,
  };
}

export type AssessmentSubmission =
  | {
    accepted: true;
    attempt: TimedAttempt;
    receipt: SubmissionReceipt;
    result: AssessmentResult;
  }
  | {
    accepted: false;
    attempt: TimedAttempt;
    reason: "invalid-request" | "stale-attempt" | "already-submitted" | "clock-reversed" | "expired";
  };

/**
 * Integrity-preserving scoring transition for interactive flows.
 *
 * Persist the returned attempt before accepting another submit. That makes
 * double clicks idempotent and prevents an old screen from overwriting a newer
 * attempt. The result timestamp comes from the accepted wall-clock receipt.
 */
export function scoreAssessmentSubmission(
  instrument: Instrument,
  responses: ResponseMap,
  attempt: TimedAttempt,
  request: SubmissionRequest,
  policy: SubmissionPolicy = {},
): AssessmentSubmission {
  const transition = submitTimedAttempt(attempt, request, policy);
  if (!transition.accepted) return transition;
  return {
    ...transition,
    result: scoreAssessment(instrument, responses, {
      takenAt: new Date(transition.receipt.submittedAtMs),
    }),
  };
}

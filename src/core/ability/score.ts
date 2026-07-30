import { newResultId } from "../prng";
import type { AbilityTest, AbilityResponses, AbilityResult, DomainScore, AbilityItem } from "./types";
import {
  submitTimedAttempt,
  type SubmissionPolicy,
  type SubmissionReceipt,
  type SubmissionRequest,
  type TimedAttempt,
} from "../timing";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * A criterion-referenced index for this item set. Harder items carry modestly
 * more weight, but no population comparison or latent fixed-capacity claim is
 * made.
 */
function practiceIndex(items: AbilityItem[], responses: AbilityResponses): number {
  if (!items.length) return 0;
  let earned = 0;
  let available = 0;
  for (const item of items) {
    const weight = 1 + (1 - item.pCorrect);
    available += weight;
    if (responses[item.id] === item.answer) earned += weight;
  }
  return clamp(Math.round((earned / available) * 100), 0, 100);
}

export function practiceObservation(index: number): string {
  if (index >= 85) return "Strong performance on this practice set";
  if (index >= 65) return "Mostly consistent performance on this practice set";
  if (index >= 40) return "Mixed performance on this practice set";
  if (index > 0) return "Developing familiarity with this practice set";
  return "Limited evidence from this attempt";
}

export function scoreAbility(test: AbilityTest, responses: AbilityResponses, resultId?: string): AbilityResult {
  const isCorrect = (it: AbilityItem) => responses[it.id] === it.answer;

  const perDomain: DomainScore[] = test.domains.map((d) => {
    const items = test.items.filter((it) => it.domain === d.id);
    const correct = items.filter(isCorrect).length;
    const index = practiceIndex(items, responses);
    return {
      domain: d.id,
      name: d.name,
      correct,
      total: items.length,
      pct: items.length ? Math.round((correct / items.length) * 100) : 0,
      practiceIndex: index,
      observation: practiceObservation(index),
    };
  });

  const correct = test.items.filter(isCorrect).length;
  const total = test.items.length;
  const index = practiceIndex(test.items, responses);

  const fp = resultId ?? newResultId();

  return {
    testId: test.id,
    responses,
    correct,
    total,
    perDomain,
    practiceIndex: index,
    observation: practiceObservation(index),
    fingerprint: fp,
  };
}

export type AbilitySubmission =
  | {
    accepted: true;
    attempt: TimedAttempt;
    receipt: SubmissionReceipt;
    result: AbilityResult;
  }
  | {
    accepted: false;
    attempt: TimedAttempt;
    reason: "invalid-request" | "stale-attempt" | "already-submitted" | "clock-reversed" | "expired";
  };

/** Score one accepted ability attempt; stale and repeat submissions are rejected. */
export function scoreAbilitySubmission(
  test: AbilityTest,
  responses: AbilityResponses,
  attempt: TimedAttempt,
  request: SubmissionRequest,
  policy: SubmissionPolicy = {},
): AbilitySubmission {
  const transition = submitTimedAttempt(attempt, request, policy);
  if (!transition.accepted) return transition;
  return { ...transition, result: scoreAbility(test, responses) };
}

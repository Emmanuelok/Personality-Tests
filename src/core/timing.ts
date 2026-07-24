/**
 * Reusable wall-clock attempt transitions.
 *
 * UI countdown state is deliberately not trusted. A submission supplies only an
 * attempt id, a unique submission id, and the observed wall-clock timestamp.
 * Elapsed time is derived from the stored start/deadline, making stale attempts,
 * double submits, clock reversal, and caller-provided elapsed-time gaming
 * explicit and testable.
 */

export interface TimedAttempt {
  attemptId: string;
  startedAtMs: number;
  deadlineAtMs?: number;
  acceptedSubmissionId?: string;
  submittedAtMs?: number;
}

export interface StartAttempt {
  attemptId: string;
  startedAtMs: number;
  durationMs?: number;
}

export interface SubmissionRequest {
  attemptId: string;
  submissionId: string;
  observedAtMs: number;
}

export interface SubmissionReceipt {
  attemptId: string;
  submissionId: string;
  startedAtMs: number;
  submittedAtMs: number;
  elapsedMs: number;
  deadlineAtMs?: number;
  expired: boolean;
}

export type SubmissionRejectReason =
  | "invalid-request"
  | "stale-attempt"
  | "already-submitted"
  | "clock-reversed"
  | "expired";

export type SubmissionTransition =
  | { accepted: true; attempt: TimedAttempt; receipt: SubmissionReceipt }
  | { accepted: false; attempt: TimedAttempt; reason: SubmissionRejectReason };

export interface SubmissionPolicy {
  /** Small event-loop allowance. Elapsed time still caps at the deadline. */
  deadlineGraceMs?: number;
  /** Useful for an explicit "time is up" auto-submit. */
  acceptAfterDeadline?: boolean;
}

const finite = (value: number): boolean => Number.isFinite(value);

export function beginTimedAttempt(start: StartAttempt): TimedAttempt {
  if (!start.attemptId.trim() || !finite(start.startedAtMs)) {
    throw new Error("A timed attempt needs a non-empty id and a finite start time.");
  }
  if (start.durationMs != null && (!finite(start.durationMs) || start.durationMs <= 0)) {
    throw new Error("Attempt duration must be a positive finite number.");
  }
  return {
    attemptId: start.attemptId,
    startedAtMs: start.startedAtMs,
    deadlineAtMs: start.durationMs == null ? undefined : start.startedAtMs + start.durationMs,
  };
}

export function wallClockElapsedMs(attempt: TimedAttempt, observedAtMs: number): number {
  if (!finite(observedAtMs) || observedAtMs < attempt.startedAtMs) return 0;
  const end = attempt.deadlineAtMs == null
    ? observedAtMs
    : Math.min(observedAtMs, attempt.deadlineAtMs);
  return Math.max(0, end - attempt.startedAtMs);
}

export function wallClockRemainingMs(attempt: TimedAttempt, observedAtMs: number): number | null {
  if (attempt.deadlineAtMs == null) return null;
  if (!finite(observedAtMs)) return Math.max(0, attempt.deadlineAtMs - attempt.startedAtMs);
  return Math.max(0, attempt.deadlineAtMs - Math.max(attempt.startedAtMs, observedAtMs));
}

export function submitTimedAttempt(
  attempt: TimedAttempt,
  request: SubmissionRequest,
  policy: SubmissionPolicy = {},
): SubmissionTransition {
  if (!request.submissionId.trim() || !finite(request.observedAtMs)) {
    return { accepted: false, attempt, reason: "invalid-request" };
  }
  if (request.attemptId !== attempt.attemptId) {
    return { accepted: false, attempt, reason: "stale-attempt" };
  }
  if (attempt.acceptedSubmissionId || attempt.submittedAtMs != null) {
    return { accepted: false, attempt, reason: "already-submitted" };
  }
  if (request.observedAtMs < attempt.startedAtMs) {
    return { accepted: false, attempt, reason: "clock-reversed" };
  }

  const grace = Math.max(0, Math.min(5_000, policy.deadlineGraceMs ?? 0));
  const expired = attempt.deadlineAtMs != null && request.observedAtMs > attempt.deadlineAtMs;
  if (
    expired &&
    !policy.acceptAfterDeadline &&
    request.observedAtMs > (attempt.deadlineAtMs as number) + grace
  ) {
    return { accepted: false, attempt, reason: "expired" };
  }

  const submittedAtMs = attempt.deadlineAtMs == null
    ? request.observedAtMs
    : Math.min(request.observedAtMs, attempt.deadlineAtMs);
  const next: TimedAttempt = {
    ...attempt,
    acceptedSubmissionId: request.submissionId,
    submittedAtMs,
  };
  return {
    accepted: true,
    attempt: next,
    receipt: {
      attemptId: attempt.attemptId,
      submissionId: request.submissionId,
      startedAtMs: attempt.startedAtMs,
      submittedAtMs,
      elapsedMs: submittedAtMs - attempt.startedAtMs,
      deadlineAtMs: attempt.deadlineAtMs,
      expired,
    },
  };
}

/** Safe conversion for scorers. Invalid or forged negative values become zero. */
export function elapsedSeconds(receipt: Pick<SubmissionReceipt, "elapsedMs">): number {
  if (!finite(receipt.elapsedMs)) return 0;
  return Math.max(0, receipt.elapsedMs) / 1_000;
}

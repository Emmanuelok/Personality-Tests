import { describe, expect, it } from "vitest";
import {
  beginTimedAttempt,
  elapsedSeconds,
  submitTimedAttempt,
  wallClockElapsedMs,
  wallClockRemainingMs,
} from "./timing";

describe("wall-clock attempt integrity", () => {
  it("derives elapsed time from the stored start instead of accepting a client duration", () => {
    const attempt = beginTimedAttempt({ attemptId: "a1", startedAtMs: 1_000, durationMs: 10_000 });
    const result = submitTimedAttempt(attempt, {
      attemptId: "a1",
      submissionId: "s1",
      observedAtMs: 5_500,
    });
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.receipt.elapsedMs).toBe(4_500);
      expect(elapsedSeconds(result.receipt)).toBe(4.5);
    }
  });

  it("rejects stale and double submits without changing the accepted state", () => {
    const attempt = beginTimedAttempt({ attemptId: "current", startedAtMs: 100 });
    expect(submitTimedAttempt(attempt, {
      attemptId: "old",
      submissionId: "stale",
      observedAtMs: 200,
    })).toMatchObject({ accepted: false, reason: "stale-attempt" });

    const first = submitTimedAttempt(attempt, {
      attemptId: "current",
      submissionId: "first",
      observedAtMs: 200,
    });
    expect(first.accepted).toBe(true);
    if (first.accepted) {
      expect(submitTimedAttempt(first.attempt, {
        attemptId: "current",
        submissionId: "second",
        observedAtMs: 300,
      })).toMatchObject({ accepted: false, reason: "already-submitted" });
    }
  });

  it("rejects clock reversal and late manual submissions", () => {
    const attempt = beginTimedAttempt({ attemptId: "a", startedAtMs: 10_000, durationMs: 1_000 });
    expect(submitTimedAttempt(attempt, {
      attemptId: "a",
      submissionId: "early-clock",
      observedAtMs: 9_999,
    })).toMatchObject({ accepted: false, reason: "clock-reversed" });
    expect(submitTimedAttempt(attempt, {
      attemptId: "a",
      submissionId: "late",
      observedAtMs: 11_001,
    })).toMatchObject({ accepted: false, reason: "expired" });
  });

  it("allows a deadline auto-submit while capping elapsed time at the deadline", () => {
    const attempt = beginTimedAttempt({ attemptId: "a", startedAtMs: 1_000, durationMs: 5_000 });
    const result = submitTimedAttempt(attempt, {
      attemptId: "a",
      submissionId: "auto",
      observedAtMs: 8_000,
    }, { acceptAfterDeadline: true });
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.receipt.expired).toBe(true);
      expect(result.receipt.submittedAtMs).toBe(6_000);
      expect(result.receipt.elapsedMs).toBe(5_000);
    }
  });

  it("reports monotonic bounded elapsed and remaining values", () => {
    const attempt = beginTimedAttempt({ attemptId: "a", startedAtMs: 1_000, durationMs: 4_000 });
    expect(wallClockElapsedMs(attempt, 500)).toBe(0);
    expect(wallClockElapsedMs(attempt, 3_000)).toBe(2_000);
    expect(wallClockElapsedMs(attempt, 9_000)).toBe(4_000);
    expect(wallClockRemainingMs(attempt, 3_000)).toBe(2_000);
    expect(wallClockRemainingMs(attempt, 9_000)).toBe(0);
  });
});

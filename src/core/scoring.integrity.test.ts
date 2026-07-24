import { describe, expect, it } from "vitest";
import type { Instrument } from "./types";
import { bigFive, loveLanguages } from "./instruments";
import { composeReport } from "./report/composer";
import {
  responseRangePosition,
  scoreAssessment,
  scoreAssessmentSubmission,
} from "./scoring";
import { beginTimedAttempt } from "./timing";

const responses = Object.fromEntries(bigFive.items.map((item) => [item.id, 3]));

describe("assessment submission integrity", () => {
  it("scores one current submission using its wall-clock receipt", () => {
    const attempt = beginTimedAttempt({ attemptId: "current", startedAtMs: 1_000 });
    const scored = scoreAssessmentSubmission(bigFive, responses, attempt, {
      attemptId: "current",
      submissionId: "submit-1",
      observedAtMs: 2_500,
    });
    expect(scored.accepted).toBe(true);
    if (scored.accepted) {
      expect(scored.receipt.elapsedMs).toBe(1_500);
      expect(scored.result.takenAt).toBe(new Date(2_500).toISOString());
    }
  });

  it("cannot score stale or duplicate submissions", () => {
    const attempt = beginTimedAttempt({ attemptId: "current", startedAtMs: 1_000 });
    expect(scoreAssessmentSubmission(bigFive, responses, attempt, {
      attemptId: "stale",
      submissionId: "old-submit",
      observedAtMs: 2_000,
    })).toMatchObject({ accepted: false, reason: "stale-attempt" });

    const first = scoreAssessmentSubmission(bigFive, responses, attempt, {
      attemptId: "current",
      submissionId: "submit-1",
      observedAtMs: 2_000,
    });
    expect(first.accepted).toBe(true);
    if (first.accepted) {
      expect(scoreAssessmentSubmission(bigFive, responses, first.attempt, {
        attemptId: "current",
        submissionId: "submit-2",
        observedAtMs: 2_100,
      })).toMatchObject({ accepted: false, reason: "already-submitted" });
    }
  });
});

const responseRangeOnly: Instrument = {
  id: "response-range-only",
  name: "Response Range Check",
  shortName: "Range Check",
  kind: "dimensional",
  category: "test",
  tagline: "A fixture without population norms.",
  description: "Used to verify that response-range position is not presented as population standing.",
  estMinutes: 1,
  responseFormat: {
    min: 1,
    max: 5,
    labels: ["1", "2", "3", "4", "5"],
  },
  scales: [{
    id: "R",
    name: "Range Lean",
    description: "A response-range-only dimension.",
    highDescriptor: "high-keyed",
    lowDescriptor: "low-keyed",
    poles: { low: "Low", high: "High" },
    // Deliberately implausible legacy values: local standing must ignore them.
    normMean: 999,
    normSd: 0.001,
  }],
  items: [
    { id: "R1", text: "I choose the high-keyed answer.", scale: "R", keyed: 1 },
    { id: "R2", text: "I choose another high-keyed answer.", scale: "R", keyed: 1 },
  ],
  citations: [],
  itemProvenance: "Test fixture.",
};

describe("trait standing semantics", () => {
  it("uses response-range standing and levels even when legacy norm parameters exist", () => {
    const result = scoreAssessment(bigFive, Object.fromEntries(bigFive.items.map((item) => [
      item.id,
      item.keyed === 1 ? 5 : 1,
    ])));

    for (const score of Object.values(result.scales)) {
      expect(score.standing).toEqual({
        kind: "response-range",
        value: score.normalized,
        position: score.normalized,
        basis: "instrument-response-range",
      });
      expect(score).not.toHaveProperty("percentile");
      expect(score.level).toBe("very high");
      expect(responseRangePosition(score)).toBe(score.normalized);
    }

    const report = composeReport(bigFive, result, { seed: 1 });
    for (const trait of report.traits) {
      expect(trait.standing.kind).toBe("response-range");
      expect(trait).not.toHaveProperty("percentile");
      expect(trait.standingLabel).toMatch(/response-range position/i);
    }
  });

  it("keeps an unnormed Likert score within the instrument response range", () => {
    const result = scoreAssessment(responseRangeOnly, { R1: 5, R2: 5 });
    const score = result.scales.R;

    expect(score.normalized).toBe(100);
    expect(score.standing).toEqual({
      kind: "response-range",
      value: 100,
      position: 100,
      basis: "instrument-response-range",
    });
    expect(score).not.toHaveProperty("percentile");

    const report = composeReport(responseRangeOnly, result, { seed: 1 });
    expect(report.traits[0]).not.toHaveProperty("percentile");
    expect(report.traits[0].standingLabel).toBe("100/100 · response-range position");
    expect(JSON.stringify(report)).not.toMatch(/\bpercentile\b/i);
    expect(report.traits[0].narrative).toMatch(/response range/i);
    expect(report.traits[0].narrative).toMatch(/no population comparison/i);
  });

  it("does not trust a legacy percentile-shaped field when norm evidence is absent", () => {
    const current = scoreAssessment(responseRangeOnly, { R1: 5, R2: 5 });
    const legacyScore = {
      ...current.scales.R,
      percentile: current.scales.R.normalized,
      standing: {
        kind: "estimated-percentile",
        value: 99,
        percentile: 99,
        basis: "approximate-population-norm",
        normMean: 3,
        normSd: 0.5,
      },
    };
    const legacy = {
      ...current,
      scales: { R: legacyScore },
    } as unknown as typeof current;

    const report = composeReport(responseRangeOnly, legacy, { seed: 1 });
    expect(report.traits[0].standing.kind).toBe("response-range");
    expect(report.traits[0].standing.position).toBe(100);
    expect(report.traits[0]).not.toHaveProperty("percentile");
    expect(JSON.stringify(report)).not.toMatch(/\bpercentile\b/i);
  });

  it("treats choice shares as response-range positions even if scale metadata has Likert norms", () => {
    const responses = Object.fromEntries(loveLanguages.items.map((item) => [item.id, 4]));
    const result = scoreAssessment(loveLanguages, responses);

    for (const score of Object.values(result.scales)) {
      expect(score.standing.kind).toBe("response-range");
      expect(score.standing.position).toBe(score.normalized);
      expect(score).not.toHaveProperty("percentile");
    }

    const report = composeReport(loveLanguages, result, { seed: 2 });
    expect(report.traits.every((trait) => !Object.prototype.hasOwnProperty.call(trait, "percentile"))).toBe(true);
    expect(JSON.stringify(report)).not.toMatch(/\bpercentile\b/i);
  });
});

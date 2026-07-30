import { describe, expect, it } from "vitest";
import { evidenceConsent, type EvidenceRecord } from "../evidence";
import { LEARNER_AGENTS, orchestrateLearner } from ".";
import type { LearnerEvidencePayload, LearnerInput } from "./types";

const evidence = (
  id: string,
  tier: EvidenceRecord["tier"] = "actionable",
  extra: Partial<EvidenceRecord<LearnerEvidencePayload>> = {},
): EvidenceRecord<LearnerEvidencePayload> => ({
  id,
  tier,
  source: "assessment",
  summary: `${id} working observation`,
  payload: { label: id, suggestedPractice: `practice ${id}` },
  ...extra,
});

const base = (records: EvidenceRecord<LearnerEvidencePayload>[]): LearnerInput => ({
  evidence: records,
  consent: evidenceConsent({ actionable: true, reflective: true, private: true, sensitive: true }),
  goals: [{ id: "focus", title: "Build focus", status: "active", priority: 1 }],
  preferences: { practiceMinutes: 12, cadence: "weekdays" },
});

describe("bounded learner intelligence", () => {
  it("runs exactly eight deterministic agents in the documented order", () => {
    expect(LEARNER_AGENTS.map((agent) => agent.id)).toEqual([
      "consent",
      "evidence-curation",
      "interpretation",
      "goal-mapping",
      "mission",
      "practice-routing",
      "progress-review",
      "reflection",
    ]);
    const input = base([evidence("focus-one", "actionable", { tags: ["focus"] })]);
    expect(orchestrateLearner(input)).toEqual(orchestrateLearner(input));
    expect(orchestrateLearner(input).trace).toHaveLength(8);
  });

  it("never exposes private content to observations, graphs, or recommendations", () => {
    const result = orchestrateLearner(base([
      evidence("safe"),
      evidence("private-id", "private", {
        summary: "PRIVATE CONTENT MUST STAY OUT",
        payload: { observation: "PRIVATE PAYLOAD MUST STAY OUT" },
      }),
    ]));
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("PRIVATE CONTENT MUST STAY OUT");
    expect(serialized).not.toContain("PRIVATE PAYLOAD MUST STAY OUT");
    expect(result.excludedEvidence).toContainEqual({
      evidenceId: "private-id",
      allowed: false,
      reason: "private-use-block",
    });
  });

  it("blocks sensitive and reflective records from autonomous routing", () => {
    const result = orchestrateLearner({
      ...base([
        evidence("action"),
        evidence("reflection", "reflective"),
        evidence("sensitive", "actionable", { sensitive: true }),
      ]),
      mode: "autonomous",
    });
    expect(result.recommendations.flatMap((rec) => rec.evidence.map((ref) => ref.id))).toEqual(["action"]);
    expect(result.observations.map((item) => item.statement).join(" ")).not.toContain("sensitive");
    expect(result.excludedEvidence.map((item) => item.evidenceId)).toEqual(["reflection", "sensitive"]);
  });

  it("keeps every recommendation transparent, actionable-only, and user-controlled", () => {
    const result = orchestrateLearner(base([
      evidence("focus-a", "actionable", { tags: ["focus"] }),
      evidence("focus-b", "actionable", { tags: ["focus"] }),
    ]));
    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const recommendation of result.recommendations) {
      expect(recommendation.userChoiceRequired).toBe(true);
      expect(recommendation.reason).toContain("Suggested because of");
      expect(recommendation.evidence.every((item) => item.tier === "actionable")).toBe(true);
      expect(recommendation.limitations.join(" ")).toMatch(/context|noise|practice/i);
    }
    expect(result.mission?.requiresConfirmation).toBe(true);
  });

  it("does not invent a mission when no goal has been chosen", () => {
    const result = orchestrateLearner({
      ...base([evidence("a")]),
      goals: [],
    });
    expect(result.mission).toBeNull();
    expect(result.goalMappings).toEqual([]);
    expect(result.reflections[0].prompt.length).toBeGreaterThan(0);
  });

  it("caps evidence and output volume", () => {
    const records = Array.from({ length: 30 }, (_, index) => evidence(`e${String(index).padStart(2, "0")}`));
    const result = orchestrateLearner({ ...base(records), maxRecommendations: 99 });
    expect(result.trace.find((item) => item.agentId === "consent")?.outputCount).toBe(24);
    expect(result.observations.length).toBeLessThanOrEqual(5);
    expect(result.practices.length).toBeLessThanOrEqual(3);
    expect(result.recommendations.length).toBeLessThanOrEqual(3);
    expect(result.reflections.length).toBeLessThanOrEqual(2);
  });

  it("treats progress as provisional until repeated evidence exists", () => {
    const one = orchestrateLearner(base([
      evidence("p1", "actionable", {
        source: "progress",
        payload: { completed: true, progress: 1 },
      }),
    ]));
    expect(one.progress?.status).toBe("insufficient-evidence");

    const repeated = orchestrateLearner(base([
      evidence("p1", "actionable", {
        source: "progress",
        payload: { completed: true, progress: 1 },
      }),
      evidence("p2", "actionable", {
        source: "progress",
        payload: { completed: true, progress: 1 },
      }),
    ]));
    expect(repeated.progress?.status).toBe("moving");
    expect(repeated.progress?.caveat).toMatch(/measurement noise|practice effects/i);
  });

  it("rejects unbounded runs and duplicate goals", () => {
    const tooMany = Array.from({ length: 101 }, (_, index) => evidence(`e${index}`));
    expect(() => orchestrateLearner(base(tooMany))).toThrow(/at most 100/);
    expect(() => orchestrateLearner({
      ...base([]),
      goals: [{ id: "same", title: "One" }, { id: "same", title: "Two" }],
    })).toThrow(/unique/);
  });
});

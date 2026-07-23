import {
  evidenceDecision,
  selectEvidence,
  toEvidenceReference,
  type EvidenceRecord,
} from "../evidence";
import type {
  EvidenceConfidence,
  GoalMapping,
  LearnerAgent,
  LearnerAgentTrace,
  LearnerEvidencePayload,
  LearnerGoal,
  LearnerInput,
  LearnerObservation,
  LearnerRecommendation,
  LearnerState,
  PracticeRoute,
} from "./types";

const MAX_CURATED = 24;
const MAX_OBSERVATIONS = 5;
const MAX_GOALS = 5;
const MAX_PRACTICES = 3;
const CHANGE_CAVEAT =
  "One observation can reflect context, measurement noise, or practice effects; repeated evidence over time is more informative.";

const trace = (
  state: LearnerState,
  item: Omit<LearnerAgentTrace, "evidenceIds"> & { evidenceIds?: string[] },
): LearnerState => ({
  ...state,
  trace: [...state.trace, { ...item, evidenceIds: item.evidenceIds ?? [] }],
});

const payload = (record: EvidenceRecord<LearnerEvidencePayload>): LearnerEvidencePayload =>
  record.payload && typeof record.payload === "object" ? record.payload : {};

const stableEvidence = (
  records: readonly EvidenceRecord<LearnerEvidencePayload>[],
): EvidenceRecord<LearnerEvidencePayload>[] =>
  [...records].sort((a, b) => a.id.localeCompare(b.id));

const activeGoals = (input: LearnerInput): LearnerGoal[] =>
  [...(input.goals ?? [])]
    .filter((goal) => goal.status !== "paused" && goal.status !== "completed")
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id))
    .slice(0, MAX_GOALS);

const confidenceFor = (evidenceIds: readonly string[]): EvidenceConfidence =>
  evidenceIds.length >= 2 ? "supported" : "tentative";

const cadence = (input: LearnerInput): string => {
  const minutes = Math.max(5, Math.min(30, Math.round(input.preferences?.practiceMinutes ?? 10)));
  const frequency = input.preferences?.cadence ?? "daily";
  return `${minutes} minutes · ${frequency}`;
};

const recommendationLimit = (input: LearnerInput): number =>
  Math.max(0, Math.min(MAX_PRACTICES, Math.round(input.maxRecommendations ?? MAX_PRACTICES)));

export const consentAgent: LearnerAgent = {
  id: "consent",
  maxOutputs: MAX_CURATED,
  run(input, state) {
    const mode = input.mode ?? "user-led";
    const selection = selectEvidence(input.evidence, "interpret", input.consent, mode);
    const reviewableEvidence = stableEvidence(selection.allowed).slice(0, MAX_CURATED);
    return trace(
      { ...state, reviewableEvidence, excludedEvidence: selection.excluded },
      {
        agentId: "consent",
        inputCount: input.evidence.length,
        outputCount: reviewableEvidence.length,
        evidenceIds: reviewableEvidence.map((record) => record.id),
        note: "Applied tier, sensitivity, and autonomy consent before any payload was read.",
      },
    );
  },
};

export const evidenceCurationAgent: LearnerAgent = {
  id: "evidence-curation",
  maxOutputs: MAX_CURATED,
  run(input, state) {
    const mode = input.mode ?? "user-led";
    const recommendationEvidence = state.reviewableEvidence
      .filter((record) => evidenceDecision(record, "recommend", input.consent, mode).allowed)
      .filter((record) => record.tier === "actionable")
      .slice(0, MAX_CURATED);
    return trace(
      { ...state, recommendationEvidence },
      {
        agentId: "evidence-curation",
        inputCount: state.reviewableEvidence.length,
        outputCount: recommendationEvidence.length,
        evidenceIds: recommendationEvidence.map((record) => record.id),
        note: "Kept only actionable evidence in the recommendation lane.",
      },
    );
  },
};

export const interpretationAgent: LearnerAgent = {
  id: "interpretation",
  maxOutputs: MAX_OBSERVATIONS,
  run(_input, state) {
    const observations: LearnerObservation[] = state.reviewableEvidence
      .filter((record) => record.tier !== "private")
      .slice(0, MAX_OBSERVATIONS)
      .map((record) => {
        const value = payload(record);
        return {
          id: `observation:${record.id}`,
          statement: value.observation ?? value.label ?? record.summary,
          evidenceIds: [record.id],
          confidence: "tentative",
          caveat: CHANGE_CAVEAT,
        };
      });
    return trace(
      { ...state, observations },
      {
        agentId: "interpretation",
        inputCount: state.reviewableEvidence.length,
        outputCount: observations.length,
        evidenceIds: observations.flatMap((observation) => observation.evidenceIds),
        note: "Produced working observations rather than identity labels or fixed conclusions.",
      },
    );
  },
};

const matchEvidenceToGoal = (
  goal: LearnerGoal,
  records: readonly EvidenceRecord<LearnerEvidencePayload>[],
): string[] => {
  const goalWords = goal.title.toLowerCase().split(/\W+/).filter((word) => word.length >= 4);
  return records
    .filter((record) => {
      const value = payload(record);
      if (value.goalId === goal.id) return true;
      const searchable = `${record.summary} ${(record.tags ?? []).join(" ")}`.toLowerCase();
      return goalWords.some((word) => searchable.includes(word));
    })
    .map((record) => record.id)
    .slice(0, 4);
};

export const goalMappingAgent: LearnerAgent = {
  id: "goal-mapping",
  maxOutputs: MAX_GOALS,
  run(input, state) {
    const goalMappings: GoalMapping[] = activeGoals(input).map((goal) => {
      const evidenceIds = matchEvidenceToGoal(goal, state.recommendationEvidence);
      return {
        goalId: goal.id,
        evidenceIds,
        rationale: evidenceIds.length
          ? `This user-chosen goal has ${evidenceIds.length} relevant actionable evidence source${evidenceIds.length === 1 ? "" : "s"}.`
          : "This goal was chosen by the user; more direct evidence would make routing more specific.",
      };
    });
    return trace(
      { ...state, goalMappings },
      {
        agentId: "goal-mapping",
        inputCount: activeGoals(input).length,
        outputCount: goalMappings.length,
        evidenceIds: goalMappings.flatMap((mapping) => mapping.evidenceIds),
        note: "Mapped evidence only to explicit, active user goals.",
      },
    );
  },
};

export const missionAgent: LearnerAgent = {
  id: "mission",
  maxOutputs: 1,
  run(input, state) {
    const goal = activeGoals(input)[0];
    if (!goal) {
      return trace(
        { ...state, mission: null },
        {
          agentId: "mission",
          inputCount: state.goalMappings.length,
          outputCount: 0,
          note: "No mission proposed because the user has not selected an active goal.",
        },
      );
    }
    const mapping = state.goalMappings.find((item) => item.goalId === goal.id);
    const mission = {
      id: `mission:${goal.id}`,
      goalId: goal.id,
      title: `A small experiment for ${goal.title}`,
      nextAction: `Choose one low-stakes practice that supports “${goal.title}”, try it, and review what happened.`,
      evidenceIds: mapping?.evidenceIds ?? [],
      requiresConfirmation: true as const,
    };
    return trace(
      { ...state, mission },
      {
        agentId: "mission",
        inputCount: state.goalMappings.length,
        outputCount: 1,
        evidenceIds: mission.evidenceIds,
        note: "Proposed one reversible mission that requires confirmation.",
      },
    );
  },
};

const practiceFor = (
  input: LearnerInput,
  record: EvidenceRecord<LearnerEvidencePayload>,
  index: number,
  goalId?: string,
): PracticeRoute => {
  const value = payload(record);
  const title = value.suggestedPractice
    ? `Try: ${value.suggestedPractice}`
    : `Test one small response to ${value.label ?? record.summary}`;
  return {
    id: `practice:${record.id}:${index + 1}`,
    title,
    action: value.suggestedPractice
      ?? "Choose one small, reversible action, then note the context and what changed.",
    cadence: cadence(input),
    goalId,
    evidenceIds: [record.id],
  };
};

export const practiceRoutingAgent: LearnerAgent = {
  id: "practice-routing",
  maxOutputs: MAX_PRACTICES,
  run(input, state) {
    const limit = recommendationLimit(input);
    const goalId = state.mission?.goalId;
    const goalEvidence = state.mission?.evidenceIds ?? [];
    const ordered = [
      ...state.recommendationEvidence.filter((record) => goalEvidence.includes(record.id)),
      ...state.recommendationEvidence.filter((record) => !goalEvidence.includes(record.id)),
    ];
    const practices = ordered.slice(0, limit).map((record, index) => practiceFor(input, record, index, goalId));
    const recommendations: LearnerRecommendation[] = practices.map((practice) => {
      const refs = practice.evidenceIds
        .map((id) => state.recommendationEvidence.find((record) => record.id === id))
        .filter((record): record is EvidenceRecord<LearnerEvidencePayload> => Boolean(record))
        .map(toEvidenceReference)
        .filter((reference): reference is NonNullable<typeof reference> => Boolean(reference));
      return {
        id: `recommendation:${practice.id}`,
        agentId: "practice-routing",
        title: practice.title,
        action: practice.action,
        reason: refs.length
          ? `Suggested because of: ${refs.map((reference) => reference.summary).join("; ")}.`
          : "Suggested as a low-stakes way to gather better evidence.",
        evidence: refs,
        confidence: confidenceFor(practice.evidenceIds),
        limitations: [CHANGE_CAVEAT, "You decide whether to try, change, or ignore this suggestion."],
        userChoiceRequired: true,
      };
    });
    return trace(
      { ...state, practices, recommendations },
      {
        agentId: "practice-routing",
        inputCount: state.recommendationEvidence.length,
        outputCount: recommendations.length,
        evidenceIds: practices.flatMap((practice) => practice.evidenceIds),
        note: "Routed only actionable evidence into reversible, opt-in practices.",
      },
    );
  },
};

export const progressReviewAgent: LearnerAgent = {
  id: "progress-review",
  maxOutputs: 1,
  run(_input, state) {
    const records = state.reviewableEvidence.filter((record) =>
      record.source === "practice" || record.source === "progress"
    );
    const completed = records.filter((record) => payload(record).completed === true).length;
    const values = records
      .map((record) => payload(record).progress)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    const positive = values.filter((value) => value > 0).length;
    const negative = values.filter((value) => value < 0).length;
    const status = records.length < 2
      ? "insufficient-evidence" as const
      : positive > 0 && negative > 0
        ? "mixed" as const
        : completed > 0 || positive > 0
          ? "moving" as const
          : "starting" as const;
    const statement = status === "insufficient-evidence"
      ? "There is not enough repeated practice evidence to describe a trend yet."
      : status === "mixed"
        ? "Recent practice observations are mixed; context may be changing the result."
        : status === "moving"
          ? "Recent logs suggest movement in the practiced task; repeat it before treating that as a stable change."
          : "Practice has started, but the current logs do not yet show a clear direction.";
    const progress = {
      status,
      statement,
      evidenceIds: records.map((record) => record.id).slice(0, 8),
      caveat: CHANGE_CAVEAT,
    };
    return trace(
      { ...state, progress },
      {
        agentId: "progress-review",
        inputCount: records.length,
        outputCount: 1,
        evidenceIds: progress.evidenceIds,
        note: "Reviewed repeated observations with an explicit noise and practice-effect caveat.",
      },
    );
  },
};

export const reflectionAgent: LearnerAgent = {
  id: "reflection",
  maxOutputs: 2,
  run(input, state) {
    const goal = activeGoals(input)[0];
    const firstObservation = state.observations[0];
    const reflections = [
      {
        id: "reflection:context",
        prompt: firstObservation
          ? `When does “${firstObservation.statement}” fit, and when does it not fit?`
          : "What context would help make the next recommendation more useful?",
        evidenceIds: firstObservation?.evidenceIds ?? [],
      },
      ...(goal ? [{
        id: `reflection:goal:${goal.id}`,
        prompt: `What would a small, observable sign of progress on “${goal.title}” look like to you?`,
        evidenceIds: state.goalMappings.find((mapping) => mapping.goalId === goal.id)?.evidenceIds ?? [],
      }] : []),
    ].slice(0, 2);
    return trace(
      { ...state, reflections },
      {
        agentId: "reflection",
        inputCount: state.observations.length + state.goalMappings.length,
        outputCount: reflections.length,
        evidenceIds: reflections.flatMap((reflection) => reflection.evidenceIds),
        note: "Returned questions for the user to answer; no reflection was inferred on their behalf.",
      },
    );
  },
};

export const LEARNER_AGENTS: readonly LearnerAgent[] = Object.freeze([
  consentAgent,
  evidenceCurationAgent,
  interpretationAgent,
  goalMappingAgent,
  missionAgent,
  practiceRoutingAgent,
  progressReviewAgent,
  reflectionAgent,
]);

export function emptyLearnerState(): LearnerState {
  return {
    reviewableEvidence: [],
    recommendationEvidence: [],
    excludedEvidence: [],
    observations: [],
    goalMappings: [],
    mission: null,
    practices: [],
    progress: null,
    reflections: [],
    recommendations: [],
    trace: [],
  };
}

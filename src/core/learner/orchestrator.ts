import { hashHex } from "../prng";
import { LEARNER_AGENTS, emptyLearnerState } from "./agents";
import { buildLearnerGraph } from "./graph";
import type { LearnerInput, LearnerRun, LearnerState } from "./types";

const MAX_INPUT_EVIDENCE = 100;

const stableRunId = (input: LearnerInput): string =>
  `learner-${hashHex([
    input.mode ?? "user-led",
    ...(input.evidence.map((record) => record.id).sort()),
    ...((input.goals ?? []).map((goal) => goal.id).sort()),
  ].join("|"))}`;

function validateInput(input: LearnerInput): void {
  if (input.evidence.length > MAX_INPUT_EVIDENCE) {
    throw new Error(`Learner runs accept at most ${MAX_INPUT_EVIDENCE} evidence records.`);
  }
  const evidenceIds = input.evidence.map((record) => record.id);
  if (evidenceIds.some((id) => !id.trim())) throw new Error("Evidence ids must be non-empty.");
  const goalIds = (input.goals ?? []).map((goal) => goal.id);
  if (new Set(goalIds).size !== goalIds.length) throw new Error("Learner goal ids must be unique.");
}

/**
 * Run the eight fixed agents in order.
 *
 * The orchestrator is pure, synchronous, local-first, and deterministic. It has
 * no network, storage, clock, random, notification, or side-effect capability.
 */
export function orchestrateLearner(input: LearnerInput): LearnerRun {
  validateInput(input);
  let state: LearnerState = emptyLearnerState();
  for (const agent of LEARNER_AGENTS) state = agent.run(input, state);

  const maxRecommendations = Math.max(0, Math.min(3, Math.round(input.maxRecommendations ?? 3)));
  const recommendations = state.recommendations.slice(0, maxRecommendations);
  const finalState = { ...state, recommendations };

  return {
    runId: input.runId ?? stableRunId(input),
    mode: input.mode ?? "user-led",
    graph: buildLearnerGraph(input, finalState),
    observations: finalState.observations,
    goalMappings: finalState.goalMappings,
    mission: finalState.mission,
    practices: finalState.practices,
    progress: finalState.progress,
    reflections: finalState.reflections,
    recommendations,
    excludedEvidence: finalState.excludedEvidence,
    trace: finalState.trace,
    guardrails: [
      "Suggestions are proposals and require user choice.",
      "Private evidence is never interpreted or routed.",
      "Reflective evidence never drives autonomous recommendations.",
      "Sensitive evidence is never available to autonomous runs.",
      "Observations can reflect context, measurement noise, practice effects, and change over time.",
    ],
  };
}

export const runLearner = orchestrateLearner;

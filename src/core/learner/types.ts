import type {
  AutonomyMode,
  EvidenceConsent,
  EvidenceDecision,
  EvidenceRecord,
  EvidenceReference,
} from "../evidence";

export const LEARNER_AGENT_IDS = [
  "consent",
  "evidence-curation",
  "interpretation",
  "goal-mapping",
  "mission",
  "practice-routing",
  "progress-review",
  "reflection",
] as const;

export type LearnerAgentId = (typeof LEARNER_AGENT_IDS)[number];

/** Optional structured fields understood by the deterministic learner agents. */
export interface LearnerEvidencePayload {
  label?: string;
  observation?: string;
  goalId?: string;
  suggestedPractice?: string;
  completed?: boolean;
  progress?: number;
  context?: string;
}

export interface LearnerGoal {
  id: string;
  title: string;
  /** Goals are chosen by the user; agents never silently activate one. */
  status?: "active" | "paused" | "completed";
  priority?: number;
}

export type EvidenceConfidence = "tentative" | "supported";

export interface LearnerObservation {
  id: string;
  statement: string;
  evidenceIds: string[];
  confidence: EvidenceConfidence;
  caveat: string;
}

export interface GoalMapping {
  goalId: string;
  evidenceIds: string[];
  rationale: string;
}

export interface LearnerMission {
  id: string;
  goalId: string;
  title: string;
  nextAction: string;
  evidenceIds: string[];
  /** A mission is always a proposal; accepting it is a separate user action. */
  requiresConfirmation: true;
}

export interface PracticeRoute {
  id: string;
  title: string;
  action: string;
  cadence: string;
  goalId?: string;
  evidenceIds: string[];
}

export interface ProgressReview {
  status: "insufficient-evidence" | "starting" | "mixed" | "moving";
  statement: string;
  evidenceIds: string[];
  caveat: string;
}

export interface LearnerReflection {
  id: string;
  prompt: string;
  evidenceIds: string[];
}

export interface LearnerRecommendation {
  id: string;
  agentId: "mission" | "practice-routing";
  title: string;
  action: string;
  reason: string;
  evidence: EvidenceReference[];
  confidence: EvidenceConfidence;
  limitations: string[];
  /** Recommendations are transparent proposals, never executed actions. */
  userChoiceRequired: true;
}

export interface LearnerPreferences {
  /** Used to size a suggested practice; clamped to 5–30 minutes. */
  practiceMinutes?: number;
  cadence?: "daily" | "weekdays" | "weekly";
}

export interface LearnerInput {
  evidence: readonly EvidenceRecord<LearnerEvidencePayload>[];
  consent: EvidenceConsent;
  goals?: readonly LearnerGoal[];
  preferences?: LearnerPreferences;
  mode?: AutonomyMode;
  /** Hard-capped to three, even if a larger value is supplied. */
  maxRecommendations?: number;
  /** Optional stable id supplied by the caller. No random/time-based ids are generated. */
  runId?: string;
}

export interface LearnerAgentTrace {
  agentId: LearnerAgentId;
  inputCount: number;
  outputCount: number;
  evidenceIds: string[];
  note: string;
}

export type LearnerNodeKind =
  | "evidence"
  | "observation"
  | "goal"
  | "mission"
  | "practice"
  | "progress"
  | "reflection";

export interface LearnerGraphNode {
  id: string;
  kind: LearnerNodeKind;
  label: string;
  createdBy: LearnerAgentId;
  evidenceIds: string[];
}

export interface LearnerGraphEdge {
  from: string;
  to: string;
  relation: "supports" | "informs" | "serves" | "reviews" | "prompts";
}

export interface LearnerGraph {
  nodes: LearnerGraphNode[];
  edges: LearnerGraphEdge[];
}

export interface LearnerState {
  reviewableEvidence: EvidenceRecord<LearnerEvidencePayload>[];
  recommendationEvidence: EvidenceRecord<LearnerEvidencePayload>[];
  excludedEvidence: EvidenceDecision[];
  observations: LearnerObservation[];
  goalMappings: GoalMapping[];
  mission: LearnerMission | null;
  practices: PracticeRoute[];
  progress: ProgressReview | null;
  reflections: LearnerReflection[];
  recommendations: LearnerRecommendation[];
  trace: LearnerAgentTrace[];
}

export interface LearnerRun {
  runId: string;
  mode: AutonomyMode;
  graph: LearnerGraph;
  observations: LearnerObservation[];
  goalMappings: GoalMapping[];
  mission: LearnerMission | null;
  practices: PracticeRoute[];
  progress: ProgressReview | null;
  reflections: LearnerReflection[];
  recommendations: LearnerRecommendation[];
  excludedEvidence: EvidenceDecision[];
  trace: LearnerAgentTrace[];
  guardrails: string[];
}

export interface LearnerAgent {
  id: LearnerAgentId;
  maxOutputs: number;
  run(input: LearnerInput, state: LearnerState): LearnerState;
}

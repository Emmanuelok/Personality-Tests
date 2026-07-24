/**
 * Psyche Atlas core — framework-agnostic assessment, scoring, report, and growth
 * engines. No DOM or React imports live here, so this module is equally usable in
 * a browser, a web worker, or a Node server.
 */

export * from "./types";
export { Rng, cyrb53, hashHex, nonce, seedFrom } from "./prng";
export {
  resolveScaleStanding,
  responseRangePosition,
  scoreAssessment,
  scoreAssessmentSubmission,
} from "./scoring";
export type { AssessmentSubmission, ScoreAssessmentOptions } from "./scoring";
export * from "./timing";
export * from "./evidence";
export * from "./learner";
export * from "./catalogPolicy";
export { recommendNext, recommendNextFromEvidence } from "./recommend";
export type { Recommendation, RecommendationOptions } from "./recommend";
export { dailyNudge, dailyNudgeFromEvidence } from "./daily";
export type { DailyEvidenceOptions, DailyNudge } from "./daily";
export { autopilotNext, autopilotNextFromEvidence } from "./autopilot";
export type { AutopilotOptions, AutopilotPick } from "./autopilot";

export { INSTRUMENTS, getInstrument, instrumentsByCategory } from "./instruments";
export { CATEGORIES, getCategory } from "./categories";
export type { Category } from "./categories";

export {
  composeReport,
  generateReport,
  createClaudeProvider,
  REPORT_LLM_INSTRUCTIONS,
} from "./report";
export type {
  PersonalityReport,
  ReportSection,
  TraitInsight,
  GenerateOptions,
  LLMProvider,
} from "./report";

export {
  computeCompatibility,
  toSummary,
  encodeSummary,
  decodeSummary,
} from "./compatibility";
export type { CompatibilityReport, CompatDimension, ResultSummary } from "./compatibility";

export { askCompanion, suggestedQuestions, buildReportKnowledge, buildIntegratedKnowledge } from "./companion";
export type { CompanionKnowledge, CompanionAnswer, KnowledgeScale } from "./companion";

export { buildIntegratedProfile, dailyInsight } from "./synthesis";
export type { IntegratedProfile, ThemeHit, Tension, OperatingNote, SynthEntry, DailyInsight } from "./synthesis";

export { buildGrowthPlan } from "./improvement/plan";
export type {
  GrowthPlan,
  GrowthArea,
  GrowthStep,
  GrowthTarget,
  GrowthDirection,
} from "./improvement/plan";

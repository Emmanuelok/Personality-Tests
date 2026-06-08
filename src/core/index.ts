/**
 * Psyche Atlas core — framework-agnostic assessment, scoring, report, and growth
 * engines. No DOM or React imports live here, so this module is equally usable in
 * a browser, a web worker, or a Node server.
 */

export * from "./types";
export { Rng, cyrb53, hashHex, nonce, seedFrom } from "./prng";
export { scoreAssessment } from "./scoring";

export { INSTRUMENTS, getInstrument, bigFive, jungTypes, enneagram } from "./instruments";

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

export { buildGrowthPlan } from "./improvement/plan";
export type {
  GrowthPlan,
  GrowthArea,
  GrowthStep,
  GrowthTarget,
  GrowthDirection,
} from "./improvement/plan";

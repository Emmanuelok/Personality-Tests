/**
 * Cognitive ABILITY testing — a maximal-performance subsystem, distinct from the
 * self-report (Likert) instruments. Items have right and wrong answers; scoring
 * counts correct responses and maps them to an estimated, heavily-caveated ability
 * band. Grounded in the public-domain ICAR framework and Cattell-Horn-Carroll (CHC)
 * theory — the model behind the WAIS, Stanford-Binet, Woodcock-Johnson, and Raven's.
 */

/** A reasoning domain id (e.g., "verbal", "numerical", "matrices", "rotation"). */
export type AbilityDomainId = string;

export interface AbilityDomain {
  id: AbilityDomainId;
  name: string;
  /** The CHC broad ability this taps. */
  chc: string;
  description: string;
}

export interface AbilityItem {
  id: string;
  domain: AbilityDomainId;
  /** The question text. */
  prompt: string;
  /** Optional self-contained SVG markup for the question figure. */
  figure?: string;
  /** Answer options (text). */
  options: string[];
  /** Optional self-contained SVG markup per option (parallel to `options`). */
  optionFigures?: string[];
  /** Index of the correct option. */
  answer: number;
  /** Estimated proportion of adults who answer correctly (item difficulty / pseudo-norm). */
  pCorrect: number;
  /** Brief explanation, revealed in the report. */
  explain: string;
}

export interface AbilityTest {
  id: string;
  name: string;
  shortName: string;
  category: string;
  tagline: string;
  description: string;
  estMinutes: number;
  /** Optional soft time limit (seconds) shown as a countdown. */
  timeLimitSec?: number;
  domains: AbilityDomain[];
  items: AbilityItem[];
  citations: { ref: string; note?: string }[];
  caveats: string[];
  itemProvenance: string;
}

/** itemId -> chosen option index (or -1 / missing for skipped). */
export type AbilityResponses = Record<string, number>;

export interface DomainScore {
  domain: AbilityDomainId;
  name: string;
  correct: number;
  total: number;
  /** Percent correct, 0..100. */
  pct: number;
  /** Estimated percentile vs. a rough adult norm, 1..99. */
  percentile: number;
}

export interface AbilityResult {
  testId: string;
  responses: AbilityResponses;
  correct: number;
  total: number;
  perDomain: DomainScore[];
  /** Overall estimated percentile (1..99). */
  percentile: number;
  /** Estimated IQ-equivalent range (deliberately a band, never a single false-precise number). */
  iqLow: number;
  iqHigh: number;
  /** Qualitative descriptor of the band. */
  band: string;
  /** Stable hash of the response vector. */
  fingerprint: string;
}

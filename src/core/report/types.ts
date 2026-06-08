import type { Level, TypeResolution } from "../types";

export interface ReportSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface TraitInsight {
  scaleId: string;
  name: string;
  percentile: number;
  normalized: number;
  mean: number;
  level: Level;
  /** Which pole this score leans toward, in words. */
  poleLabel: string;
  /** A tailored paragraph describing this trait for this person. */
  narrative: string;
  strengths: string[];
  watchouts: string[];
}

export interface PersonalityReport {
  instrumentId: string;
  instrumentName: string;
  generatedAt: string;
  /** Unique per generation — two reports never share one. */
  reportId: string;
  seedHex: string;
  /** Identifies the underlying answers (shared if answers are identical). */
  responseFingerprint: string;
  title: string;
  subtitle: string;
  overview: string[];
  type?: TypeResolution;
  traits: TraitInsight[];
  dynamics: string[];
  sections: ReportSection[];
  signatureResponses: string[];
  uniqueness: { reportId: string; seedHex: string; note: string };
  /** "deterministic" or the name of the LLM provider that composed the prose. */
  engine: string;
}

export interface GenerateOptions {
  /**
   * Fixed seed to reproduce a previously generated report byte-for-byte. When
   * omitted, a fresh high-entropy seed is used so the report is unique.
   */
  seed?: number;
  /** Optional AI provider; when supplied and available it composes the prose. */
  llm?: LLMProvider | null;
  /** Wall-clock used in the seed and timestamps (injectable for tests). */
  now?: Date;
}

/**
 * Pluggable narrative engine. The deterministic composer is always available;
 * when an LLMProvider is supplied (e.g., backed by the Claude API), it can take
 * over prose composition from the same structured findings.
 */
export interface LLMProvider {
  name: string;
  available(): boolean;
  compose(input: {
    structured: PersonalityReport;
    instructions: string;
  }): Promise<PersonalityReport>;
}

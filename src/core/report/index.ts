import type { AssessmentResult, Instrument } from "../types";
import { composeReport } from "./composer";
import type { GenerateOptions, PersonalityReport } from "./types";

export * from "./types";
export { composeReport } from "./composer";
export { createClaudeProvider } from "./llm";

/**
 * Instructions handed to an optional LLM provider. The model is asked to elevate
 * the prose of the already-structured, already-scored report WITHOUT changing any
 * numbers, levels, type, or factual findings — keeping the science intact while
 * making the language richer and more personal.
 */
export const REPORT_LLM_INSTRUCTIONS = `You are an expert personality psychologist and a gifted writer.
You will receive a fully scored, structured personality report as JSON. Rewrite ONLY the prose
(overview paragraphs, trait narratives, dynamics, and section paragraphs) so it reads as a warm,
insightful, highly individualized letter to this specific person.

Hard rules:
- Never change any number, standing kind, level, type code, or factual claim.
- Describe every local scale value only as a response-range position; never turn it into a population rank or percentile.
- Do not invent scores or traits that aren't in the data.
- Preserve the JSON shape exactly; only replace string contents of prose fields.
- Vary sentence rhythm and vocabulary while keeping repeated runs internally consistent.
- Be honest and non-flattering where the data warrants; avoid horoscope vagueness.`;

/**
 * Generate a report. Always composes the deterministic, uniqueness-guaranteed
 * report first; if an available LLM provider is supplied, it elevates the prose
 * from that same structured base. Falls back to deterministic on any LLM error.
 */
export async function generateReport(
  instrument: Instrument,
  result: AssessmentResult,
  opts: GenerateOptions = {},
): Promise<PersonalityReport> {
  const base = composeReport(instrument, result, opts);
  const llm = opts.llm;
  if (llm && llm.available()) {
    try {
      const enriched = await llm.compose({ structured: base, instructions: REPORT_LLM_INSTRUCTIONS });
      return { ...enriched, engine: llm.name };
    } catch {
      return base;
    }
  }
  return base;
}

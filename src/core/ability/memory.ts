import { cyrb53 } from "../prng";
import { normalCdf } from "./score";

/**
 * Working-memory span — a reveal-then-recall test (digit span), the classic
 * measure of short-term/working memory (Gsm). Forward span taps storage; backward
 * span taps storage PLUS mental manipulation. This is a maximal-performance task
 * with its own timing, separate from the multiple-choice ability tests.
 */

export type SpanMode = "forward" | "backward";

export interface MemoryTrial {
  mode: SpanMode;
  span: number;
  shown: string;   // the digit string presented
  entered: string; // what the user typed
  correct: boolean;
}

export interface MemoryResult {
  trials: MemoryTrial[];
  maxForward: number;
  maxBackward: number;
  forwardCorrect: number;
  backwardCorrect: number;
  percentile: number;
  band: string;
  fingerprint: string;
}

/** Test configuration: the spans probed, in order, for each block. */
export const MEMORY_TEST = {
  id: "memory-span",
  name: "Working Memory Span",
  shortName: "Memory",
  category: "cognition",
  tagline: "How many items you can hold — and juggle — in mind at once.",
  description:
    "A live test of working memory (Gsm): you'll see a string of digits, it disappears, and you type it back. " +
    "First in the order shown (forward span — pure storage), then in reverse (backward span — storage plus mental " +
    "manipulation). It's brief, it climbs in difficulty, and it measures something the reasoning tests don't.",
  forward: [3, 4, 5, 6, 7, 8],
  backward: [3, 4, 5, 6, 7],
  /** milliseconds the string is shown, per digit. */
  msPerDigit: 750,
  citations: [
    { ref: "Wechsler, D. (2008). Wechsler Adult Intelligence Scale (WAIS-IV). Pearson.", note: "Digit Span is a core WAIS working-memory subtest." },
    { ref: "Baddeley, A. (2000). The episodic buffer: a new component of working memory? Trends in Cognitive Sciences, 4(11), 417–423." },
  ],
  caveats: [
    "This is an EDUCATIONAL estimate, not a clinical assessment. Real working-memory testing is done under controlled conditions by a professional.",
    "Browsers, distractions, and the urge to write things down all affect the result — please don't note the digits down; let your memory do the work.",
    "Working memory is only one slice of the mind, and it can be trained a little and varies with sleep, stress, and age.",
    "This measures a specific capacity, not your intelligence, worth, or potential.",
  ],
} as const;

const band = (combined: number): string => {
  if (combined >= 8) return "Very high range";
  if (combined >= 6.5) return "Above-average range";
  if (combined >= 5) return "Average range";
  if (combined >= 3.5) return "Below-average range";
  return "Well-below-average range";
};

export function scoreMemory(trials: MemoryTrial[]): MemoryResult {
  const maxFor = (mode: SpanMode) =>
    trials.filter((t) => t.mode === mode && t.correct).reduce((m, t) => Math.max(m, t.span), 0);
  const maxForward = maxFor("forward");
  const maxBackward = maxFor("backward");
  const forwardCorrect = trials.filter((t) => t.mode === "forward" && t.correct).length;
  const backwardCorrect = trials.filter((t) => t.mode === "backward" && t.correct).length;

  // Rough adult norms: forward span ~6.5 (sd 1.3), backward ~4.8 (sd 1.3).
  const zf = (maxForward - 6.5) / 1.3;
  const zb = (maxBackward - 4.8) / 1.3;
  const z = (zf + zb) / 2;
  const percentile = Math.max(1, Math.min(99, Math.round(normalCdf(z) * 100)));
  const combined = (maxForward + maxBackward) / 2;

  const fp = cyrb53("mem|" + trials.map((t) => `${t.mode[0]}${t.span}:${t.correct ? 1 : 0}`).join(",")).toString(36);
  return { trials, maxForward, maxBackward, forwardCorrect, backwardCorrect, percentile, band: band(combined), fingerprint: fp };
}

/** Generate a random digit string of the given length (digits 1–9). */
export function makeDigits(span: number): string {
  let s = "";
  for (let i = 0; i < span; i++) s += String(1 + Math.floor(Math.random() * 9));
  return s;
}

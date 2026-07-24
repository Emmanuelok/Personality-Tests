import { newResultId } from "../prng";
import { practiceObservation } from "./score";

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
  practiceIndex: number;
  observation: string;
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
    "This is an educational practice snapshot, not a clinical assessment.",
    "Browsers, distractions, and the urge to write things down all affect the result — please don't note the digits down; let your memory do the work.",
    "Working-memory performance varies with sleep, stress, context, strategy, and prior practice.",
    "Read the practice index as an observation about this task and sitting, not as a fixed personal trait.",
  ],
} as const;

interface SpanScale { fMax: number; bMax: number; prefix: string }

function spanResult(trials: MemoryTrial[], scale: SpanScale, resultId?: string): MemoryResult {
  const maxFor = (mode: SpanMode) =>
    trials.filter((t) => t.mode === mode && t.correct).reduce((m, t) => Math.max(m, t.span), 0);
  const maxForward = maxFor("forward");
  const maxBackward = maxFor("backward");
  const forwardCorrect = trials.filter((t) => t.mode === "forward" && t.correct).length;
  const backwardCorrect = trials.filter((t) => t.mode === "backward" && t.correct).length;

  const forwardIndex = Math.min(1, maxForward / scale.fMax);
  const backwardIndex = Math.min(1, maxBackward / scale.bMax);
  const practiceIndex = Math.round(((forwardIndex + backwardIndex) / 2) * 100);

  const fp = resultId ?? newResultId();
  return {
    trials,
    maxForward,
    maxBackward,
    forwardCorrect,
    backwardCorrect,
    practiceIndex,
    observation: practiceObservation(practiceIndex),
    fingerprint: fp,
  };
}

/** Digit-span practice index relative to this flow's longest presented spans. */
export function scoreMemory(trials: MemoryTrial[], resultId?: string): MemoryResult {
  return spanResult(trials, {
    fMax: Math.max(...MEMORY_TEST.forward),
    bMax: Math.max(...MEMORY_TEST.backward),
    prefix: "mem",
  }, resultId);
}

/** Corsi practice index relative to this flow's longest presented spans. */
export function scoreCorsi(trials: MemoryTrial[], resultId?: string): MemoryResult {
  return spanResult(trials, {
    fMax: Math.max(...CORSI_TEST.forward),
    bMax: Math.max(...CORSI_TEST.backward),
    prefix: "corsi",
  }, resultId);
}

/** A random sequence of `span` distinct block indices in 0..count-1. */
export function makeSequence(span: number, count: number): number[] {
  const pool = Array.from({ length: count }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, span);
}

/** Corsi block-tapping test configuration. */
export const CORSI_TEST = {
  id: "corsi-blocks",
  name: "Spatial Memory (Corsi)",
  shortName: "Corsi",
  category: "cognition",
  tagline: "Watch a path light up across the board — then tap it back from memory.",
  description:
    "The Corsi block-tapping test is the visual-spatial counterpart to digit span. Blocks light up one by one in a " +
    "sequence; you reproduce it by tapping them in the same order (then in reverse). This activity records how you " +
    "reproduced spatial paths in this sitting. It is a task-specific practice observation, not an estimate of fixed " +
    "memory capacity or a comparison with verbal or numerical performance.",
  blocks: [
    { x: 44, y: 64 }, { x: 158, y: 32 }, { x: 262, y: 74 },
    { x: 74, y: 156 }, { x: 206, y: 146 }, { x: 296, y: 188 },
    { x: 116, y: 250 }, { x: 240, y: 268 }, { x: 40, y: 286 },
  ],
  forward: [2, 3, 4, 5, 6, 7],
  backward: [2, 3, 4, 5, 6],
  litMs: 550,
  gapMs: 280,
  citations: [
    { ref: "Corsi, P. M. (1972). Human memory and the medial temporal region of the brain. (Doctoral dissertation, McGill University.)" },
    { ref: "Kessels, R. P. C., et al. (2000). The Corsi Block-Tapping Task: standardization and normative data. Applied Neuropsychology, 7(4), 252–258." },
  ],
  caveats: [
    "This is an educational practice snapshot, not a clinical assessment.",
    "Screen size, pointer accuracy, and distractions all affect the result — treat one sitting as a rough snapshot.",
    "Spatial-memory task performance varies with sleep, stress, context, strategy, and prior practice.",
    "Read the practice index as an observation about this task and sitting, not as a fixed personal trait.",
  ],
} as const;

/** Generate a random digit string of the given length (digits 1–9). */
export function makeDigits(span: number): string {
  let s = "";
  for (let i = 0; i < span; i++) s += String(1 + Math.floor(Math.random() * 9));
  return s;
}

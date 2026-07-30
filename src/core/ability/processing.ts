import { newResultId } from "../prng";
import { elapsedSeconds, type SubmissionReceipt } from "../timing";
import { practiceObservation } from "./score";

/**
 * Processing speed (Gs) — a timed, rapid-decision test in the spirit of the WAIS
 * Symbol Search subtest. You decide, again and again, whether a target symbol
 * appears in a small search set. Score is net-correct within a fixed time window.
 */

export interface SpeedResult {
  correct: number;
  errors: number;
  attempted: number;
  durationSec: number;
  /** Net-correct per minute. */
  rate: number;
  practiceIndex: number;
  observation: string;
  fingerprint: string;
}

export const PROCESSING_TEST = {
  id: "processing-speed",
  name: "Processing Speed",
  shortName: "Speed",
  category: "cognition",
  tagline: "How fast and accurately you make simple visual decisions.",
  description:
    "Processing speed (Gs) is the quiet engine behind almost everything else — how quickly you take in and act on " +
    "simple information. In the spirit of the WAIS Symbol Search subtest, you'll decide as fast as you can whether a " +
    "target symbol appears in a small set. It's brief, it's against the clock, and accuracy still counts.",
  symbols: ["▲", "■", "●", "◆", "★", "✦", "▼", "◑", "✚", "❖"],
  targetsPerTrial: 2,
  searchSize: 5,
  durationSec: 90,
  citations: [
    { ref: "Wechsler, D. (2008). WAIS-IV. Pearson.", note: "Symbol Search is a core Processing Speed subtest." },
    { ref: "Salthouse, T. A. (1996). The processing-speed theory of adult age differences in cognition. Psychological Review, 103(3), 403–428." },
  ],
  caveats: [
    "This is an educational practice snapshot, not a clinical assessment.",
    "Input device, screen, and distractions all affect speed — a touchscreen and a mouse won't score the same.",
    "Performance on this task varies with sleep, focus, familiarity, prior practice, and context.",
    "Read the practice index as an observation about this task and sitting, not as a fixed personal trait.",
  ],
} as const;

type ProcessingTiming = number | Pick<SubmissionReceipt, "elapsedMs">;

/**
 * Score one processing-speed sitting.
 *
 * A wall-clock receipt is preferred. A numeric duration remains accepted for
 * local callers, but durations shorter than half the designed window are scored
 * as half a window so rapid early submission cannot inflate the result.
 */
export function scoreProcessing(
  correct: number,
  errors: number,
  attempted: number,
  timing: ProcessingTiming,
  resultId?: string,
): SpeedResult {
  const safeAttempted = Math.max(0, Math.floor(Number.isFinite(attempted) ? attempted : 0));
  const safeCorrect = Math.max(0, Math.min(safeAttempted, Math.floor(Number.isFinite(correct) ? correct : 0)));
  const safeErrors = Math.max(
    0,
    Math.min(safeAttempted - safeCorrect, Math.floor(Number.isFinite(errors) ? errors : 0)),
  );
  const reportedSeconds = typeof timing === "number" ? timing : elapsedSeconds(timing);
  const durationSec = Math.max(
    PROCESSING_TEST.durationSec / 2,
    Math.min(PROCESSING_TEST.durationSec, Number.isFinite(reportedSeconds) ? reportedSeconds : 0),
  );
  const net = Math.max(0, safeCorrect - safeErrors);
  const accuracy = safeAttempted ? safeCorrect / safeAttempted : 0;
  const targetForWindow = 45 * (durationSec / PROCESSING_TEST.durationSec);
  const pace = Math.min(1, net / Math.max(1, targetForWindow));
  const practiceIndex = Math.round((accuracy * 0.4 + pace * 0.6) * 100);
  const rate = Math.round((net / durationSec) * 600) / 10;
  const fp = resultId ?? newResultId();
  return {
    correct: safeCorrect,
    errors: safeErrors,
    attempted: safeAttempted,
    durationSec,
    rate,
    practiceIndex,
    observation: practiceObservation(practiceIndex),
    fingerprint: fp,
  };
}

/** Build one trial: a set of targets, a search set, and whether a target is present. */
export function makeSpeedTrial(): { targets: string[]; search: string[]; present: boolean } {
  const pool = [...PROCESSING_TEST.symbols];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const targets = pool.slice(0, PROCESSING_TEST.targetsPerTrial);
  const rest = pool.slice(PROCESSING_TEST.targetsPerTrial);
  const present = Math.random() < 0.5;
  const search: string[] = [];
  if (present) search.push(targets[Math.floor(Math.random() * targets.length)]);
  while (search.length < PROCESSING_TEST.searchSize) {
    const s = rest[Math.floor(Math.random() * rest.length)];
    if (!search.includes(s)) search.push(s);
  }
  for (let i = search.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [search[i], search[j]] = [search[j], search[i]];
  }
  return { targets, search, present };
}

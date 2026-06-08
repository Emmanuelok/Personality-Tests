import { cyrb53 } from "../prng";
import { normalCdf } from "./score";

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
  percentile: number;
  band: string;
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
    "This is an EDUCATIONAL estimate, not a clinical assessment, and cannot replace a professionally administered test.",
    "Input device, screen, and distractions all affect speed — a touchscreen and a mouse won't score the same.",
    "Processing speed is just one capacity; it naturally declines with age and varies with sleep and focus.",
    "It measures speed on a simple task, not intelligence, worth, or potential.",
  ],
} as const;

function band(percentile: number): string {
  if (percentile >= 91) return "Very high range";
  if (percentile >= 75) return "Above-average range";
  if (percentile >= 25) return "Average range";
  if (percentile >= 9) return "Below-average range";
  return "Well-below-average range";
}

export function scoreProcessing(correct: number, errors: number, attempted: number, durationSec: number): SpeedResult {
  const net = Math.max(0, correct - errors);
  // Rough norm: ~30 net-correct in 90s (sd ~9), scaled to the actual duration.
  const scale = durationSec / 90;
  const mean = 30 * scale;
  const sd = 9 * Math.sqrt(Math.max(scale, 0.1));
  const z = (net - mean) / sd;
  const percentile = Math.max(1, Math.min(99, Math.round(normalCdf(z) * 100)));
  const rate = Math.round((net / Math.max(durationSec, 1)) * 600) / 10; // net per minute, 1 dp
  const fp = cyrb53(`speed|${correct}|${errors}|${attempted}|${durationSec}`).toString(36);
  return { correct, errors, attempted, durationSec, rate, percentile, band: band(percentile), fingerprint: fp };
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

import { newResultId } from "../prng";
import { practiceObservation } from "./score";
import { cellCount, cellSize, cellRot, cellMarks, grid, option, type Shape } from "./matrix";

/**
 * Adaptive Reasoning — a lightweight computer-adaptive matrix test. Difficulty
 * climbs when you're right and eases when you're wrong (a 1-up/1-down staircase),
 * keeping practice near the current response pattern in fewer items. Every item
 * is generated from an explicit rule, so the key is correct by construction.
 */

export interface AdaptiveItem {
  prompt: string;
  figure: string;
  options: string[];
  optionFigures: string[];
  answer: number;
}
export interface AdaptiveTrial { level: number; correct: boolean }
export interface AdaptiveResult {
  trials: AdaptiveTrial[];
  abilityLevel: number;
  correct: number;
  total: number;
  practiceIndex: number;
  observation: string;
  fingerprint: string;
}

export const ADAPTIVE_TEST = {
  id: "adaptive-reasoning",
  name: "Adaptive Reasoning",
  shortName: "Adaptive",
  category: "cognition",
  tagline: "Difficulty adapts to your responses — focused practice in fewer questions.",
  description:
    "A computer-adaptive matrix test: get one right and the next is harder; miss one and it eases off. By honing in on " +
    "the challenge level reached in this sitting, it keeps the activity focused without claiming a fixed ability. Every " +
    "puzzle is generated fresh, so no two runs are quite the same.",
  startLevel: 3,
  minLevel: 1,
  maxLevel: 7,
  burnIn: 3,
  maxItems: 16,
  citations: [
    { ref: "Weiss, D. J. (1982). Improving measurement quality and efficiency with adaptive testing. Applied Psychological Measurement, 6(4), 473–492." },
    { ref: "Raven, J. (2000). The Raven's Progressive Matrices. Cognitive Psychology, 41(1), 1–48." },
  ],
  caveats: [
    "This is an educational practice snapshot, not a clinical assessment.",
    "Adaptive scoring is approximate here — a calibrated item-response engine would require representative data; this uses rule-based difficulty levels.",
    "The practice index describes performance on these generated puzzles in this sitting.",
    "Sleep, familiarity, input device, distraction, and prior practice can all change the observation.",
  ],
} as const;

const SHAPES: Shape[] = ["circle", "square", "triangle", "diamond"];
const MARKS = ["v", "h", "d1", "d2", "o"];
const rint = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(arr: T[]): T[] => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uni = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));

function assemble(answerInner: string, distractors: string[]): { options: string[]; optionFigures: string[]; answer: number } {
  const at = rint(6);
  const cells = [...distractors];
  cells.splice(at, 0, answerInner);
  return { options: cells.map((_, i) => `Option ${i + 1}`), optionFigures: cells.map(option), answer: at };
}

const PROMPT = "Which figure completes the grid?";

export function genItem(level: number): AdaptiveItem {
  const lvl = Math.max(1, Math.min(7, level));

  if (lvl <= 1) {
    const sh = shuffle(SHAPES).slice(0, 3);
    const cells = [cellCount(1, sh[0]), cellCount(2, sh[0]), cellCount(3, sh[0]), cellCount(1, sh[1]), cellCount(2, sh[1]), cellCount(3, sh[1]), cellCount(1, sh[2]), cellCount(2, sh[2]), null];
    const ans = cellCount(3, sh[2]);
    const dist = [cellCount(2, sh[2]), cellCount(1, sh[2]), cellCount(3, sh[0]), cellCount(3, sh[1]), cellCount(4, sh[2])];
    return { prompt: PROMPT, figure: grid(cells), ...assemble(ans, dist) };
  }
  if (lvl === 2) {
    const sh = shuffle(SHAPES).slice(0, 3);
    const sz = [7, 12, 18];
    const cells = [cellSize(sz[0], sh[0]), cellSize(sz[1], sh[0]), cellSize(sz[2], sh[0]), cellSize(sz[0], sh[1]), cellSize(sz[1], sh[1]), cellSize(sz[2], sh[1]), cellSize(sz[0], sh[2]), cellSize(sz[1], sh[2]), null];
    const ans = cellSize(18, sh[2]);
    const dist = [cellSize(12, sh[2]), cellSize(7, sh[2]), cellSize(18, sh[0]), cellSize(24, sh[2]), cellSize(18, sh[1])];
    return { prompt: PROMPT, figure: grid(cells), ...assemble(ans, dist) };
  }
  if (lvl === 3 || lvl === 4) {
    const base = rint(12) * 15;
    const rstep = lvl === 3 ? 90 : 60;
    const cstep = lvl === 3 ? 45 : 30;
    const cell = (r: number, c: number) => cellRot(base + r * rstep + c * cstep);
    const cells = [cell(0, 0), cell(0, 1), cell(0, 2), cell(1, 0), cell(1, 1), cell(1, 2), cell(2, 0), cell(2, 1), null];
    const a = base + 2 * rstep + 2 * cstep;
    const ans = cellRot(a);
    const dist = [cellRot(a + 45), cellRot(a - 45), cellRot(a + 90), cellRot(a + 180), cellRot(a - 90)];
    return { prompt: PROMPT, figure: grid(cells), ...assemble(ans, dist) };
  }
  // Overlay (union) — rows define marks; col 3 = col 1 ∪ col 2. Harder levels use more marks.
  const m = shuffle(MARKS);
  let rows: [string[], string[]][];
  let distractors: string[];
  if (lvl === 5) {
    rows = [[[m[0]], [m[1]]], [[m[1]], [m[2]]], [[m[0]], [m[2]]]];
    const u = uni(rows[2][0], rows[2][1]); // {m0,m2}
    distractors = [cellMarks(rows[2][0]), cellMarks(rows[2][1]), cellMarks([m[0], m[2], m[1]]), cellMarks([m[0], m[1]]), cellMarks([m[1], m[2]])];
    return { prompt: PROMPT, figure: grid(buildOverlay(rows)), ...assemble(cellMarks(u), distractors) };
  }
  if (lvl === 6) {
    rows = [[[m[0], m[1]], [m[2]]], [[m[1], m[2]], [m[3]]], [[m[0], m[3]], [m[1]]]];
    const u = uni(rows[2][0], rows[2][1]); // {m0,m3,m1}
    distractors = [cellMarks(rows[2][0]), cellMarks(rows[2][1]), cellMarks([...u, m[2]]), cellMarks([m[0], m[3]]), cellMarks([m[0], m[1]])];
    return { prompt: PROMPT, figure: grid(buildOverlay(rows)), ...assemble(cellMarks(u), distractors) };
  }
  rows = [[[m[0], m[1]], [m[2], m[3]]], [[m[1], m[2]], [m[3], m[4]]], [[m[0], m[1]], [m[3], m[4]]]];
  const u = uni(rows[2][0], rows[2][1]); // {m0,m1,m3,m4}
  distractors = [cellMarks(rows[2][0]), cellMarks(rows[2][1]), cellMarks([...u, m[2]]), cellMarks([m[0], m[1], m[3]]), cellMarks([m[0], m[3], m[4]])];
  return { prompt: PROMPT, figure: grid(buildOverlay(rows)), ...assemble(cellMarks(u), distractors) };
}

function buildOverlay(rows: [string[], string[]][]): (string | null)[] {
  return [
    cellMarks(rows[0][0]), cellMarks(rows[0][1]), cellMarks(uni(rows[0][0], rows[0][1])),
    cellMarks(rows[1][0]), cellMarks(rows[1][1]), cellMarks(uni(rows[1][0], rows[1][1])),
    cellMarks(rows[2][0]), cellMarks(rows[2][1]), null,
  ];
}

export function scoreAdaptive(trials: AdaptiveTrial[], resultId?: string): AdaptiveResult {
  const tail = trials.slice(ADAPTIVE_TEST.burnIn);
  const pool = tail.length ? tail : trials;
  const abilityLevel = pool.length
    ? pool.reduce((sum, trial) => sum + trial.level, 0) / pool.length
    : ADAPTIVE_TEST.minLevel;
  const correct = trials.filter((t) => t.correct).length;
  const levelIndex = ((abilityLevel - ADAPTIVE_TEST.minLevel) /
    (ADAPTIVE_TEST.maxLevel - ADAPTIVE_TEST.minLevel)) * 75;
  const accuracyIndex = trials.length ? (correct / trials.length) * 25 : 0;
  const practiceIndex = Math.max(0, Math.min(100, Math.round(levelIndex + accuracyIndex)));
  const fp = resultId ?? newResultId();
  return {
    trials, abilityLevel: Math.round(abilityLevel * 10) / 10, correct, total: trials.length,
    practiceIndex, observation: practiceObservation(practiceIndex), fingerprint: fp,
  };
}

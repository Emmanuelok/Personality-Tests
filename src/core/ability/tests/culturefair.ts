import type { AbilityItem, AbilityTest } from "../types";
import { flag } from "../figures";
import { cellCount, cellSize, cellRot, cellMarks, grid, series, option, type Shape } from "../matrix";

/**
 * Abstract Reasoning (Culture-Fair) — a nonverbal reasoning test in the tradition
 * of Raven's Progressive Matrices and the Cattell Culture-Fair test. Three figural
 * domains: matrix completion, figure series, and mental rotation. Because every
 * figure is generated from an explicit rule, each answer key is correct by
 * construction. Items are ORIGINAL to this platform.
 */

// Assemble 6 options around a constructed-correct answer cell.
function opts(answerInner: string, distractors: string[], answerAt: number) {
  const cells = [...distractors];
  cells.splice(answerAt, 0, answerInner);
  return { options: cells.map((_, i) => `Option ${i + 1}`), optionFigures: cells.map(option), answer: answerAt };
}

const C: Shape = "circle", S: Shape = "square", T: Shape = "triangle", D: Shape = "diamond";

// ── Matrices (shape by row, count by column) ──
function countMatrix(id: string, rows: [Shape, Shape, Shape], answerAt: number, p: number): AbilityItem {
  const cells = [
    cellCount(1, rows[0]), cellCount(2, rows[0]), cellCount(3, rows[0]),
    cellCount(1, rows[1]), cellCount(2, rows[1]), cellCount(3, rows[1]),
    cellCount(1, rows[2]), cellCount(2, rows[2]), null,
  ];
  const ans = cellCount(3, rows[2]);
  const dist = [cellCount(2, rows[2]), cellCount(4, rows[2]), cellCount(3, rows[0]), cellCount(3, rows[1]), cellCount(1, rows[2])];
  return { id, domain: "matrices", prompt: "Which figure completes the grid?", figure: grid(cells), ...opts(ans, dist, answerAt), pCorrect: p, explain: "Each row uses one shape; each column adds one more of it. The last row needs three." };
}

function rotMatrix(id: string, base: number, rstep: number, cstep: number, answerAt: number, p: number): AbilityItem {
  const cell = (r: number, c: number) => cellRot(base + r * rstep + c * cstep);
  const cells = [cell(0, 0), cell(0, 1), cell(0, 2), cell(1, 0), cell(1, 1), cell(1, 2), cell(2, 0), cell(2, 1), null];
  const a = base + 2 * rstep + 2 * cstep;
  const ans = cellRot(a);
  const dist = [cellRot(a + 45), cellRot(a - 45), cellRot(a + 90), cellRot(a + 180), cellRot(a - 90)];
  return { id, domain: "matrices", prompt: "Which figure completes the grid?", figure: grid(cells), ...opts(ans, dist, answerAt), pCorrect: p, explain: "The arrow turns by a fixed amount across each column and down each row." };
}

function overlayMatrix(id: string, rowMarks: [string[], string[]][], answerAt: number, p: number): AbilityItem {
  const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));
  const cells = [
    cellMarks(rowMarks[0][0]), cellMarks(rowMarks[0][1]), cellMarks(union(rowMarks[0][0], rowMarks[0][1])),
    cellMarks(rowMarks[1][0]), cellMarks(rowMarks[1][1]), cellMarks(union(rowMarks[1][0], rowMarks[1][1])),
    cellMarks(rowMarks[2][0]), cellMarks(rowMarks[2][1]), null,
  ];
  const u = union(rowMarks[2][0], rowMarks[2][1]);
  const ans = cellMarks(u);
  const dist = [cellMarks(rowMarks[2][0]), cellMarks(rowMarks[2][1]), cellMarks([...u, "d1"]), cellMarks(u.slice(0, 1)), cellMarks(["o"])];
  return { id, domain: "matrices", prompt: "Which figure completes the grid?", figure: grid(cells), ...opts(ans, dist, answerAt), pCorrect: p, explain: "The third cell in each row overlays the marks from the first two." };
}

// ── Series ──
function rotSeries(id: string, start: number, step: number, answerAt: number, p: number): AbilityItem {
  const shown = [cellRot(start), cellRot(start + step), cellRot(start + 2 * step)];
  const a = start + 3 * step;
  const ans = cellRot(a);
  const dist = [cellRot(a + step), cellRot(a - step), cellRot(a + 90), cellRot(a + 180), cellRot(start)];
  return { id, domain: "series", prompt: "What comes next in the series?", figure: series(shown), ...opts(ans, dist, answerAt), pCorrect: p, explain: `Each figure turns ${step}° from the one before it.` };
}

function sizeSeries(id: string, shape: Shape, sizes: [number, number, number], next: number, answerAt: number, p: number): AbilityItem {
  const shown = sizes.map((s) => cellSize(s, shape));
  const ans = cellSize(next, shape);
  const other: Shape = shape === "circle" ? "square" : "circle";
  const dist = [cellSize(sizes[2], shape), cellSize(sizes[1], shape), cellSize(next, other), cellSize(next + 6, shape), cellSize(sizes[0], shape)];
  return { id, domain: "series", prompt: "What comes next in the series?", figure: series(shown), ...opts(ans, dist, answerAt), pCorrect: p, explain: "The shape changes size by a steady step each time." };
}

// size grows across columns; shape set by row
function sizeMatrix(id: string, rows: [Shape, Shape, Shape], sizes: [number, number, number], answerAt: number, p: number): AbilityItem {
  const cell = (r: number, c: number) => cellSize(sizes[c], rows[r]);
  const cells = [cell(0, 0), cell(0, 1), cell(0, 2), cell(1, 0), cell(1, 1), cell(1, 2), cell(2, 0), cell(2, 1), null];
  const ans = cellSize(sizes[2], rows[2]);
  const dist = [cellSize(sizes[1], rows[2]), cellSize(sizes[0], rows[2]), cellSize(sizes[2], rows[0]), cellSize(sizes[2] + 6, rows[2]), cellSize(sizes[2], rows[1])];
  return { id, domain: "matrices", prompt: "Which figure completes the grid?", figure: grid(cells), ...opts(ans, dist, answerAt), pCorrect: p, explain: "Each row uses one shape; it grows by a steady step across the columns." };
}

// ── Series ──
function countSeries(id: string, start: number, shape: Shape, answerAt: number, p: number): AbilityItem {
  const shown = [cellCount(start, shape), cellCount(start + 1, shape), cellCount(start + 2, shape)];
  const ans = cellCount(start + 3, shape);
  const other: Shape = shape === "circle" ? "square" : "circle";
  const dist = [cellCount(start + 2, shape), cellCount(start + 1, shape), cellCount(start + 3, other), cellCount(Math.max(1, start - 1), shape), cellCount(start, shape)];
  return { id, domain: "series", prompt: "What comes next in the series?", figure: series(shown), ...opts(ans, dist, answerAt), pCorrect: p, explain: "The number of shapes goes up by one each step." };
}

// ── Mental rotation (odd one out) ──
function rotOdd(id: string, angles: number[], mirrorAt: number, p: number): AbilityItem {
  return {
    id, domain: "rotation",
    prompt: "Three figures are the same shape rotated. Which one is a mirror image — not just a rotation?",
    options: ["Figure 1", "Figure 2", "Figure 3", "Figure 4"],
    optionFigures: angles.map((a, i) => flag(a, i === mirrorAt)),
    answer: mirrorAt, pCorrect: p,
    explain: "Rotation never flips a shape's handedness; the reflected flag is the odd one out.",
  };
}

// ── Classification (odd one out) ──
function classify(id: string, cells: string[], oddIndex: number, p: number, explain: string): AbilityItem {
  return {
    id, domain: "classification",
    prompt: "Which figure does not belong with the others?",
    options: cells.map((_, i) => `Figure ${i + 1}`),
    optionFigures: cells.map(option),
    answer: oddIndex, pCorrect: p, explain,
  };
}

const items: AbilityItem[] = [
  // Matrices (12)
  countMatrix("M1", [C, S, T], 2, 0.58),
  countMatrix("M2", [D, C, S], 4, 0.55),
  countMatrix("M3", [T, D, C], 0, 0.5),
  countMatrix("M4", [S, T, D], 3, 0.48),
  rotMatrix("M5", 0, 90, 45, 0, 0.5),
  rotMatrix("M6", 30, 60, 30, 3, 0.46),
  rotMatrix("M7", 0, 45, 90, 4, 0.45),
  rotMatrix("M8", 90, 30, 60, 1, 0.42),
  overlayMatrix("M9", [[["v"], ["h"]], [["d1"], ["d2"]], [["v", "o"], ["h"]]], 1, 0.44),
  overlayMatrix("M10", [[["o"], ["v"]], [["h"], ["d1"]], [["d2"], ["o"]]], 5, 0.42),
  sizeMatrix("M11", [C, S, T], [7, 12, 18], 2, 0.52),
  sizeMatrix("M12", [D, T, C], [18, 12, 7], 4, 0.48),
  // Series (8)
  rotSeries("S1", 0, 45, 0, 0.62),
  rotSeries("S2", 0, 60, 2, 0.58),
  rotSeries("S3", 90, 45, 3, 0.55),
  sizeSeries("S4", "circle", [8, 13, 18], 23, 1, 0.6),
  sizeSeries("S5", "triangle", [22, 16, 10], 4, 3, 0.55),
  sizeSeries("S6", "square", [6, 11, 16], 21, 4, 0.55),
  countSeries("S7", 1, "circle", 0, 0.64),
  countSeries("S8", 2, "square", 2, 0.58),
  // Rotation (6)
  rotOdd("O1", [0, 90, 180, 270], 1, 0.58),
  rotOdd("O2", [45, 135, 225, 315], 2, 0.5),
  rotOdd("O3", [30, 120, 210, 300], 0, 0.52),
  rotOdd("O4", [60, 150, 240, 330], 3, 0.47),
  rotOdd("O5", [20, 110, 200, 290], 2, 0.45),
  rotOdd("O6", [15, 75, 165, 255], 0, 0.44),
  // Classification (4)
  classify("K1", [cellCount(2, C), cellCount(4, C), cellCount(3, C), cellCount(4, C), cellCount(2, C)], 2, 0.55,
    "Four figures show an even number of shapes; one shows an odd number."),
  classify("K2", [cellSize(13, S), cellSize(13, T), cellSize(13, D), cellSize(13, S), cellSize(13, C)], 4, 0.5,
    "Four figures are straight-edged; one (the circle) is curved."),
  classify("K3", [cellCount(1, T), cellCount(3, T), cellCount(5, T), cellCount(3, T), cellCount(2, T)], 4, 0.48,
    "Four figures show an odd number of shapes; one shows an even number."),
  classify("K4", [cellRot(0), cellRot(90), cellRot(180), cellMarks(["o"]), cellRot(270)], 3, 0.5,
    "Four figures are arrows; one is a circle."),
];

export const culturefair: AbilityTest = {
  id: "culture-fair",
  name: "Abstract Reasoning (Culture-Fair)",
  shortName: "Culture-Fair",
  category: "cognition",
  tagline: "A nonverbal, language-free reasoning test — matrices, series, and rotation.",
  description:
    "In the tradition of Raven's Progressive Matrices and Cattell's Culture-Fair test, this is a purely visual measure " +
    "of fluid reasoning (Gf) — no words or numbers, so it leans less on language and schooling. You'll complete matrix " +
    "patterns, continue figure series, and spot mirror images. A clean look at raw pattern-finding.",
  estMinutes: 22,
  timeLimitSec: 22 * 60,
  domains: [
    { id: "matrices", name: "Matrix Reasoning", chc: "Gf — fluid reasoning", description: "Inferring the rule that completes a 3×3 grid of figures." },
    { id: "series", name: "Figure Series", chc: "Gf — fluid reasoning", description: "Continuing a visual sequence by its underlying rule." },
    { id: "rotation", name: "Mental Rotation", chc: "Gv — visual-spatial", description: "Telling rotations of a shape from its mirror image." },
    { id: "classification", name: "Classification", chc: "Gf — fluid reasoning", description: "Spotting the figure that breaks a shared rule." },
  ],
  items,
  itemProvenance:
    "Original, procedurally-generated items written for this platform, modeled on the figural reasoning of Raven's Progressive Matrices and the Cattell Culture-Fair Intelligence Test.",
  caveats: [
    "This is an EDUCATIONAL estimate, not a clinically administered IQ test, and cannot replace a professional assessment.",
    "'Culture-fair' means it leans less on language and schooling than verbal tests — but no test is entirely free of culture or practice effects.",
    "Your score is reported as a band and a percentile, never a single precise number.",
    "Reasoning tests measure particular skills, not your worth, creativity, or potential. No real-life decision should rest on this.",
  ],
  citations: [
    { ref: "Raven, J. (2000). The Raven's Progressive Matrices: Change and stability over culture and time. Cognitive Psychology, 41(1), 1–48." },
    { ref: "Cattell, R. B. (1971). Abilities: Their Structure, Growth, and Action. Houghton Mifflin.", note: "Culture-Fair Intelligence Test and the Gf–Gc distinction." },
    { ref: "Condon, D. M., & Revelle, W. (2014). The International Cognitive Ability Resource (ICAR). Intelligence, 43, 52–64." },
  ],
};

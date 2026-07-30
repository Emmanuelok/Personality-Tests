/**
 * Matrix / series puzzle builders for the culture-fair reasoning test. Every cell
 * is rendered from explicit parameters and the answer is the cell the rule actually
 * produces — so the key is correct by construction, and distractors are deliberately
 * different cells. All output is self-contained SVG-string markup (no DOM).
 */

export type Shape = "circle" | "square" | "triangle" | "diamond";

const ROOT = `fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;

function shapeEl(shape: Shape, cx: number, cy: number, r: number): string {
  switch (shape) {
    case "circle": return `<circle cx="${cx}" cy="${cy}" r="${r}" />`;
    case "square": return `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" rx="2" />`;
    case "triangle": return `<polygon points="${cx},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy + r}" />`;
    case "diamond": return `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" />`;
  }
}

const POS: Record<number, [number, number][]> = {
  1: [[45, 45]],
  2: [[28, 45], [62, 45]],
  3: [[22, 45], [45, 45], [68, 45]],
  4: [[30, 30], [60, 30], [30, 60], [60, 60]],
  5: [[30, 30], [60, 30], [45, 45], [30, 60], [60, 60]],
};

/** n copies of a shape arranged in a cell. */
export function cellCount(n: number, shape: Shape): string {
  return (POS[n] ?? POS[1]).map(([x, y]) => shapeEl(shape, x, y, 9)).join("");
}

/** one shape at a given radius (size progression). */
export function cellSize(r: number, shape: Shape): string {
  return shapeEl(shape, 45, 45, r);
}

/** an up-arrow rotated `deg` degrees clockwise about the cell centre. */
export function cellRot(deg: number): string {
  return `<g transform="rotate(${deg} 45 45)"><line x1="45" y1="24" x2="45" y2="66" /><polygon points="45,16 37,32 53,32" fill="currentColor" /></g>`;
}

const MARK: Record<string, string> = {
  v: `<line x1="45" y1="20" x2="45" y2="70" />`,
  h: `<line x1="20" y1="45" x2="70" y2="45" />`,
  d1: `<line x1="24" y1="24" x2="66" y2="66" />`,
  d2: `<line x1="66" y1="24" x2="24" y2="66" />`,
  o: `<circle cx="45" cy="45" r="15" />`,
};
/** the union of line/ring marks in a cell (overlay rule). */
export function cellMarks(marks: string[]): string {
  return marks.map((m) => MARK[m]).join("");
}

/** Compose a 3×3 grid; pass `null` for the hidden (answer) cell. */
export function grid(cells: (string | null)[]): string {
  const S = 90;
  let body = `<line x1="${S}" y1="0" x2="${S}" y2="${3 * S}" opacity="0.4"/><line x1="${2 * S}" y1="0" x2="${2 * S}" y2="${3 * S}" opacity="0.4"/>`;
  body += `<line x1="0" y1="${S}" x2="${3 * S}" y2="${S}" opacity="0.4"/><line x1="0" y1="${2 * S}" x2="${3 * S}" y2="${2 * S}" opacity="0.4"/>`;
  cells.forEach((inner, i) => {
    const r = Math.floor(i / 3), c = i % 3;
    if (inner === null) {
      body += `<text x="${c * S + S / 2}" y="${r * S + S / 2 + 12}" text-anchor="middle" font-size="34" font-family="Georgia, serif" fill="currentColor" stroke="none">?</text>`;
    } else {
      body += `<g transform="translate(${c * S} ${r * S})">${inner}</g>`;
    }
  });
  return `<svg viewBox="0 0 ${3 * S} ${3 * S}" ${ROOT}>${body}</svg>`;
}

/** A left-to-right series with a trailing hidden cell. */
export function series(cells: string[]): string {
  const S = 90;
  const n = cells.length + 1;
  let body = "";
  cells.forEach((inner, i) => { body += `<g transform="translate(${i * S} 0)">${inner}</g>`; });
  body += `<text x="${cells.length * S + S / 2}" y="${S / 2 + 12}" text-anchor="middle" font-size="34" font-family="Georgia, serif" fill="currentColor" stroke="none">?</text>`;
  return `<svg viewBox="0 0 ${n * S} ${S}" ${ROOT}>${body}</svg>`;
}

/** Wrap a single cell as one answer-option figure. */
export function option(inner: string): string {
  return `<svg viewBox="0 0 90 90" ${ROOT}>${inner}</svg>`;
}

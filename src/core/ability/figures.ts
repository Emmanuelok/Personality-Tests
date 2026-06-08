/**
 * Pure SVG-string builders for ability-test figures (no DOM — just markup the UI
 * renders). The mental-rotation flag is intentionally chiral (no rotational or
 * mirror symmetry), so a mirror image can never coincide with a rotation — which
 * makes the "odd one out" answer correct by construction, not by hand-judgement.
 */

function svg(inner: string): string {
  return (
    `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" ` +
    `fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
  );
}

/** A chiral "flag" (pole + right-pointing pennant + top knob), rotated and optionally mirrored. */
export function flag(deg: number, mirrored = false): string {
  const t = `rotate(${deg} 50 50)${mirrored ? " translate(100 0) scale(-1 1)" : ""}`;
  return svg(
    `<g transform="${t}">` +
      `<line x1="34" y1="22" x2="34" y2="82" />` +
      `<polygon points="34,26 72,39 34,52" fill="currentColor" />` +
      `<circle cx="34" cy="20" r="5" fill="currentColor" stroke="none" />` +
    `</g>`,
  );
}

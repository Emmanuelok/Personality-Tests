/**
 * Small, dependency-free text utilities used by the report composer.
 * Kept pure so the composer stays deterministic and testable.
 */

export function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

/** 1 -> "1st", 2 -> "2nd", 73 -> "73rd". */
export function ordinal(n: number): string {
  const r = Math.round(n);
  const s = ["th", "st", "nd", "rd"];
  const v = r % 100;
  return r + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Join with commas and a closing conjunction ("a, b, and c"). */
export function oxford(list: string[], conj = "and"): string {
  const items = list.filter(Boolean);
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conj} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${conj} ${items[items.length - 1]}`;
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : plural ?? `${singular}s`;
}

/** Collapse whitespace and fix spacing before punctuation produced by templating. */
export function tidy(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

/** Ensure a sentence ends with terminal punctuation. */
export function sentence(s: string): string {
  const t = tidy(s);
  if (!t) return t;
  return /[.!?]$/.test(t) ? capitalize(t) : capitalize(t) + ".";
}

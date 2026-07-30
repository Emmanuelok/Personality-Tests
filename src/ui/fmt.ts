import type { Level } from "@core/types";
import type { Locale } from "../i18n/strings";

/** Localized display formatting for score levels and separate community-reference percentiles. */

const LEVELS: Record<Locale, Record<Level, string>> = {
  en: { "very low": "very low", low: "low", moderate: "moderate", high: "high", "very high": "very high" },
  es: { "very low": "muy bajo", low: "bajo", moderate: "moderado", high: "alto", "very high": "muy alto" },
  fr: { "very low": "très bas", low: "bas", moderate: "modéré", high: "élevé", "very high": "très élevé" },
};

export function levelLabel(level: Level, locale: Locale): string {
  return LEVELS[locale]?.[level] ?? level;
}

function enOrdinal(n: number): string {
  const r = Math.round(n);
  const s = ["th", "st", "nd", "rd"];
  const v = r % 100;
  return r + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Community-reference display: "73rd percentile" / "percentil 73" / "73e centile". */
export function pctLabel(p: number, locale: Locale): string {
  const r = Math.round(p);
  if (locale === "es") return `percentil ${r}`;
  if (locale === "fr") return `${r}e centile`;
  return `${enOrdinal(r)} percentile`;
}

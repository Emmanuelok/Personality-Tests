import type { AssessmentResult, Instrument } from "./types";
import { getInstrument } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";

/**
 * Wellbeing Portrait — a cross-context meta-synthesis.
 *
 * The platform has many wellbeing instruments, each a window on one slice of
 * flourishing: self-compassion, resilience, emotion regulation, stress, worry,
 * PERMA, gratitude, optimism, hope, mood, affect, life satisfaction, self-
 * efficacy, self-esteem, Ryff, EQ, curiosity, and time perspective. This engine
 * reads across whichever ones a person has taken and resolves five life-spanning
 * dimensions of wellbeing — Self-Kindness, Resilience, Positive Emotion, Meaning
 * & Agency, and Connection — each cross-validated across instruments, then
 * narrates the one picture they form.
 *
 * Pure, deterministic, locale-aware, and decoupled from the synthesis layer
 * (mirrors converge.ts / commsynth.ts) to stay cycle-free. Risk scales (stress,
 * worry, negative affect, pessimism, the harsher self-compassion facets, Past-
 * Negative, Present-Fatalistic, suppression) are direction-flipped so a higher
 * dimension score always means greater wellbeing.
 */

type Loc = "en" | "es" | "fr";
const cLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

/** Wellbeing instruments that can feed the portrait, in rough catalog order. */
export const WELLBEING_INSTRUMENT_IDS = [
  "self-compassion-scs", "self-esteem-rses", "brief-resilience", "emotion-regulation-erq",
  "perceived-stress", "worry-checkin", "time-perspective-ztpi", "panas-affect", "mood-checkin",
  "optimism-lotr", "gratitude-gq6", "perma-flourishing", "hope-scale", "life-satisfaction-swls",
  "self-efficacy-gse", "ryff-wellbeing", "curiosity-cei", "emotional-intelligence",
] as const;

export interface WellThemeSource {
  instrumentId: string;
  instrumentName: string;
}
export interface WellTheme {
  id: string;
  name: string;
  /** 0..100, direction-adjusted so high = greater wellbeing. */
  score: number;
  /** Localized band phrase, e.g. "a clear strength". */
  band: string;
  lowLabel: string;
  highLabel: string;
  /** Instruments that fed this dimension (distinct). */
  sources: WellThemeSource[];
}
export interface WellbeingPortrait {
  themes: WellTheme[];
  topStrength?: WellTheme;
  topGrowth?: WellTheme;
  /** Localized synthesis narrative. */
  insight: string;
  /** Which wellbeing instruments contributed. */
  instrumentsUsed: { id: string; name: string }[];
}

interface Src { inst: string; scale: string; dir: 1 | -1; w: number }
interface ThemeDef {
  id: string;
  name: Record<Loc, string>;
  low: Record<Loc, string>;
  high: Record<Loc, string>;
  sources: Src[];
}

const THEMES: ThemeDef[] = [
  {
    id: "kindness",
    name: { en: "Self-Kindness", es: "Autobondad", fr: "Bienveillance envers soi" },
    low: { en: "Self-critical", es: "Autocrítico", fr: "Autocritique" },
    high: { en: "Self-kind", es: "Amable contigo", fr: "Bienveillant" },
    sources: [
      { inst: "self-compassion-scs", scale: "SK", dir: 1, w: 1 },
      { inst: "self-compassion-scs", scale: "MI", dir: 1, w: 0.6 },
      { inst: "self-compassion-scs", scale: "SJ", dir: -1, w: 0.8 },
      { inst: "self-compassion-scs", scale: "IS", dir: -1, w: 0.6 },
      { inst: "self-compassion-scs", scale: "OI", dir: -1, w: 0.6 },
      { inst: "self-esteem-rses", scale: "EST", dir: 1, w: 0.5 },
    ],
  },
  {
    id: "resilience",
    name: { en: "Resilience", es: "Resiliencia", fr: "Résilience" },
    low: { en: "Easily shaken", es: "Fácilmente afectado", fr: "Vite ébranlé" },
    high: { en: "Resilient", es: "Resiliente", fr: "Résilient" },
    sources: [
      { inst: "brief-resilience", scale: "RES", dir: 1, w: 1 },
      { inst: "emotion-regulation-erq", scale: "REAP", dir: 1, w: 0.6 },
      { inst: "perceived-stress", scale: "STRESS", dir: -1, w: 0.7 },
      { inst: "worry-checkin", scale: "CALM", dir: 1, w: 0.5 },
      { inst: "worry-checkin", scale: "STDY", dir: 1, w: 0.5 },
      { inst: "time-perspective-ztpi", scale: "PN", dir: -1, w: 0.4 },
      { inst: "panas-affect", scale: "NA", dir: -1, w: 0.4 },
    ],
  },
  {
    id: "positivity",
    name: { en: "Positive Emotion", es: "Emoción positiva", fr: "Émotion positive" },
    low: { en: "Flat", es: "Apagado", fr: "Éteint" },
    high: { en: "Positive", es: "Positivo", fr: "Positif" },
    sources: [
      { inst: "optimism-lotr", scale: "OPT", dir: 1, w: 0.8 },
      { inst: "optimism-lotr", scale: "PES", dir: -1, w: 0.6 },
      { inst: "gratitude-gq6", scale: "GRAT", dir: 1, w: 0.8 },
      { inst: "panas-affect", scale: "PA", dir: 1, w: 0.6 },
      { inst: "mood-checkin", scale: "MOOD", dir: 1, w: 0.5 },
      { inst: "perma-flourishing", scale: "POS", dir: 1, w: 0.7 },
      { inst: "life-satisfaction-swls", scale: "SWL", dir: 1, w: 0.6 },
      { inst: "hope-scale", scale: "AGENCY", dir: 1, w: 0.4 },
    ],
  },
  {
    id: "meaning",
    name: { en: "Meaning & Agency", es: "Sentido y agencia", fr: "Sens et agentivité" },
    low: { en: "Adrift", es: "A la deriva", fr: "À la dérive" },
    high: { en: "Purposeful", es: "Con propósito", fr: "Habité d'un but" },
    sources: [
      { inst: "perma-flourishing", scale: "MEA", dir: 1, w: 0.8 },
      { inst: "perma-flourishing", scale: "ENG", dir: 1, w: 0.6 },
      { inst: "perma-flourishing", scale: "ACC", dir: 1, w: 0.6 },
      { inst: "hope-scale", scale: "PATHWAYS", dir: 1, w: 0.5 },
      { inst: "hope-scale", scale: "AGENCY", dir: 1, w: 0.5 },
      { inst: "self-efficacy-gse", scale: "GSE", dir: 1, w: 0.6 },
      { inst: "time-perspective-ztpi", scale: "FU", dir: 1, w: 0.4 },
      { inst: "time-perspective-ztpi", scale: "PF", dir: -1, w: 0.4 },
      { inst: "ryff-wellbeing", scale: "PUR", dir: 1, w: 0.5 },
      { inst: "ryff-wellbeing", scale: "GRO", dir: 1, w: 0.5 },
      { inst: "curiosity-cei", scale: "STRETCH", dir: 1, w: 0.3 },
    ],
  },
  {
    id: "connection",
    name: { en: "Connection", es: "Conexión", fr: "Connexion" },
    low: { en: "Isolated", es: "Aislado", fr: "Isolé" },
    high: { en: "Connected", es: "Conectado", fr: "Relié" },
    sources: [
      { inst: "perma-flourishing", scale: "REL", dir: 1, w: 0.9 },
      { inst: "ryff-wellbeing", scale: "REL", dir: 1, w: 0.6 },
      { inst: "emotional-intelligence", scale: "EM", dir: 1, w: 0.4 },
      { inst: "emotional-intelligence", scale: "SS", dir: 1, w: 0.4 },
      { inst: "self-compassion-scs", scale: "CH", dir: 1, w: 0.5 },
    ],
  },
];

const BAND: Record<Loc, (s: number) => string> = {
  en: (s) => (s >= 70 ? "a clear strength" : s >= 55 ? "a solid base" : s >= 45 ? "balanced" : s >= 30 ? "an area to nurture" : "a real growth edge"),
  es: (s) => (s >= 70 ? "una clara fortaleza" : s >= 55 ? "una base sólida" : s >= 45 ? "equilibrada" : s >= 30 ? "un área por cultivar" : "un verdadero punto de crecimiento"),
  fr: (s) => (s >= 70 ? "un atout net" : s >= 55 ? "une base solide" : s >= 45 ? "équilibrée" : s >= 30 ? "un point à cultiver" : "un vrai axe de progrès"),
};

const INSIGHT: Record<Loc, (n: number, top: string, topBand: string, grow: string) => string> = {
  en: (n, top, topBand, grow) =>
    `Woven across ${n} wellbeing ${n === 1 ? "test" : "tests"}, your brightest dimension is ${top} — ${topBand}. The one with the most room to grow is ${grow}. Wellbeing is built, not fixed: small, repeated practice in your growth edge lifts the whole picture.`,
  es: (n, top, topBand, grow) =>
    `Entretejida a partir de ${n} ${n === 1 ? "prueba" : "pruebas"} de bienestar, tu dimensión más luminosa es ${top}: ${topBand}. La que tiene más margen de mejora es ${grow}. El bienestar se construye, no es fijo: una práctica pequeña y repetida en tu punto de crecimiento eleva todo el conjunto.`,
  fr: (n, top, topBand, grow) =>
    `Tissée à partir de ${n} ${n === 1 ? "test" : "tests"} de bien-être, votre dimension la plus lumineuse est ${top} — ${topBand}. Celle avec le plus de marge de progression est ${grow}. Le bien-être se construit, il n'est pas figé : une pratique modeste et répétée sur votre axe de progrès élève tout le tableau.`,
};

/**
 * Resolve the five wellbeing dimensions from a flat map of normalized scale
 * scores (instrumentId → scaleId → 0..100). The shared core used by both the
 * individual portrait (from one person's results) and the group portrait (from
 * each member's shared scores). No "≥2 instruments" gate — that's a UX choice
 * the callers apply. Per-instrument aggregation prevents a multi-scale test from
 * double-counting; risk scales are direction-flipped so higher = healthier.
 */
export function wellbeingThemesFromScores(
  scores: Record<string, Record<string, number>>,
  opts: { locale?: string } = {},
): WellTheme[] {
  const loc = cLoc(opts.locale);
  const themes: WellTheme[] = [];
  for (const t of THEMES) {
    const perInst = new Map<string, { num: number; den: number }>();
    for (const s of t.sources) {
      const v = scores[s.inst]?.[s.scale];
      if (typeof v !== "number") continue;
      const pos = s.dir === 1 ? v : 100 - v;
      const cur = perInst.get(s.inst) ?? { num: 0, den: 0 };
      cur.num += pos * s.w;
      cur.den += s.w;
      perInst.set(s.inst, cur);
    }
    if (!perInst.size) continue;
    let sum = 0;
    const sources: WellThemeSource[] = [];
    for (const [instId, agg] of perInst) {
      sum += agg.num / agg.den;
      const inst = getInstrument(instId);
      if (inst) sources.push({ instrumentId: instId, instrumentName: localizeInstrument(inst, loc).shortName });
    }
    const score = Math.round(sum / perInst.size);
    themes.push({ id: t.id, name: t.name[loc], score, band: BAND[loc](score), lowLabel: t.low[loc], highLabel: t.high[loc], sources });
  }
  return themes;
}

/** Build the cross-context wellbeing portrait, or null if fewer than two
 *  wellbeing instruments have been taken (a single test is better read on its
 *  own report than synthesized). */
export function analyzeWellbeing(
  entries: { instrument: Instrument; result: AssessmentResult }[],
  opts: { locale?: string } = {},
): WellbeingPortrait | null {
  const loc = cLoc(opts.locale);
  const byId = new Map(entries.map((e) => [e.instrument.id, e] as const));
  const present = WELLBEING_INSTRUMENT_IDS.filter((id) => byId.has(id));
  if (present.length < 2) return null;

  const scores: Record<string, Record<string, number>> = {};
  for (const e of entries) {
    const row: Record<string, number> = {};
    for (const [sid, sc] of Object.entries(e.result.scales)) row[sid] = sc.normalized;
    scores[e.instrument.id] = row;
  }
  const themes = wellbeingThemesFromScores(scores, { locale: opts.locale });
  if (!themes.length) return null;

  const sorted = [...themes].sort((a, b) => b.score - a.score);
  const topStrength = sorted[0];
  const topGrowth = sorted[sorted.length - 1];
  const instrumentsUsed = present.map((id) => {
    const inst = getInstrument(id)!;
    return { id, name: localizeInstrument(inst, loc).name };
  });
  const insight = INSIGHT[loc](present.length, topStrength.name, topStrength.band, topGrowth.name);

  return { themes, topStrength, topGrowth, insight, instrumentsUsed };
}

/**
 * The smartest single next test for someone with a wellbeing portrait: a fresh
 * lens on their weakest covered dimension (their growth edge). Returns the
 * highest-weight instrument that feeds that dimension but hasn't been taken yet,
 * or null when there's no portrait or nothing left to add. Powers a gap-aware,
 * non-spammy nudge in the recommendation engine.
 */
export function wellbeingGrowthNudge(
  entries: { instrument: Instrument; result: AssessmentResult }[],
  opts: { locale?: string } = {},
): { dimensionId: string; dimensionName: string; instrumentId: string } | null {
  const portrait = analyzeWellbeing(entries, opts);
  if (!portrait || !portrait.topGrowth) return null;
  const def = THEMES.find((t) => t.id === portrait.topGrowth!.id);
  if (!def) return null;
  const done = new Set(entries.map((e) => e.instrument.id));
  const seen = new Set<string>();
  const candidate = [...def.sources]
    .sort((a, b) => b.w - a.w)
    .map((s) => s.inst)
    .find((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return !done.has(id) && Boolean(getInstrument(id));
    });
  if (!candidate) return null;
  return { dimensionId: portrait.topGrowth.id, dimensionName: portrait.topGrowth.name, instrumentId: candidate };
}

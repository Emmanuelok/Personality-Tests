import type { AssessmentResult, Instrument } from "./types";
import { getInstrument } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";

/**
 * Communication Portrait — a cross-context meta-synthesis.
 *
 * The platform has four communication & conflict instruments: the general
 * Thomas–Kilmann conflict-style, plus the Couple, Team, and general
 * Communication & Conflict tests. Each is a window on the same underlying
 * skills, seen from a different angle. This engine reads across whichever ones a
 * person has taken and resolves five context-spanning competencies — Assertive
 * Voice, Listening & Empathy, Collaboration, Composure & Repair, and Engagement —
 * cross-validated across instruments, then narrates the one picture they form.
 *
 * Pure, deterministic, locale-aware, and decoupled from the synthesis layer
 * (mirrors converge.ts) to stay cycle-free. Risk scales (Four Horsemen,
 * demand–withdraw, relationship friction, avoiding) are direction-flipped so a
 * higher theme score always means healthier communication.
 */

type Loc = "en" | "es" | "fr";
const cLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

/** The four communication & conflict instruments, in catalog order. */
export const COMM_INSTRUMENT_IDS = ["conflict-style", "couple-communication", "team-communication", "communication-style"] as const;

export interface CommThemeSource {
  instrumentId: string;
  instrumentName: string;
}
export interface CommTheme {
  id: string;
  name: string;
  /** 0..100, direction-adjusted so high = healthier communication. */
  score: number;
  /** Localized band phrase, e.g. "a clear strength". */
  band: string;
  lowLabel: string;
  highLabel: string;
  /** Instruments that fed this theme (distinct). */
  sources: CommThemeSource[];
}
export interface CommunicationPortrait {
  themes: CommTheme[];
  topStrength?: CommTheme;
  topGrowth?: CommTheme;
  /** Localized synthesis narrative. */
  insight: string;
  /** Which communication instruments contributed. */
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
    id: "assertive",
    name: { en: "Assertive Voice", es: "Voz asertiva", fr: "Voix assertive" },
    low: { en: "Reserved", es: "Reservado", fr: "Réservé" },
    high: { en: "Assertive", es: "Asertivo", fr: "Assertif" },
    sources: [
      { inst: "communication-style", scale: "ASSERT", dir: 1, w: 1 },
      { inst: "team-communication", scale: "OPEN", dir: 1, w: 0.6 },
      { inst: "conflict-style", scale: "COMPETE", dir: 1, w: 0.35 },
    ],
  },
  {
    id: "listening",
    name: { en: "Listening & Empathy", es: "Escucha y empatía", fr: "Écoute et empathie" },
    low: { en: "Self-focused", es: "Centrado en sí", fr: "Centré sur soi" },
    high: { en: "Attuned", es: "Sintonizado", fr: "À l'écoute" },
    sources: [
      { inst: "communication-style", scale: "LISTEN", dir: 1, w: 1 },
      { inst: "communication-style", scale: "EMPATH", dir: 1, w: 1 },
      { inst: "couple-communication", scale: "RESPOND", dir: 1, w: 0.7 },
    ],
  },
  {
    id: "collaboration",
    name: { en: "Collaboration", es: "Colaboración", fr: "Collaboration" },
    low: { en: "Positional", es: "Posicional", fr: "Positionnel" },
    high: { en: "Collaborative", es: "Colaborador", fr: "Collaboratif" },
    sources: [
      { inst: "communication-style", scale: "COLLAB", dir: 1, w: 1 },
      { inst: "conflict-style", scale: "COLLAB", dir: 1, w: 1 },
      { inst: "team-communication", scale: "RESOLVE", dir: 1, w: 0.7 },
      { inst: "couple-communication", scale: "CONSTR", dir: 1, w: 0.5 },
    ],
  },
  {
    id: "composure",
    name: { en: "Composure & Repair", es: "Compostura y reparación", fr: "Sang-froid et réparation" },
    low: { en: "Reactive", es: "Reactivo", fr: "Réactif" },
    high: { en: "Composed", es: "Sereno", fr: "Posé" },
    sources: [
      { inst: "communication-style", scale: "REGUL", dir: 1, w: 1 },
      { inst: "couple-communication", scale: "REPAIR", dir: 1, w: 0.9 },
      { inst: "couple-communication", scale: "HORSE", dir: -1, w: 0.7 },
      { inst: "team-communication", scale: "FRICTION", dir: -1, w: 0.4 },
    ],
  },
  {
    id: "engagement",
    name: { en: "Engagement", es: "Implicación", fr: "Engagement" },
    low: { en: "Avoids", es: "Evita", fr: "Évite" },
    high: { en: "Engages", es: "Aborda", fr: "Aborde" },
    sources: [
      { inst: "communication-style", scale: "ENGAGE", dir: 1, w: 1 },
      { inst: "conflict-style", scale: "AVOID", dir: -1, w: 0.8 },
      { inst: "couple-communication", scale: "DEMWD", dir: -1, w: 0.6 },
      { inst: "team-communication", scale: "RESOLVE", dir: 1, w: 0.4 },
    ],
  },
];

const BAND: Record<Loc, (s: number) => string> = {
  en: (s) => (s >= 70 ? "a clear strength" : s >= 55 ? "a solid skill" : s >= 45 ? "balanced" : s >= 30 ? "an area to grow" : "a real growth edge"),
  es: (s) => (s >= 70 ? "una clara fortaleza" : s >= 55 ? "una habilidad sólida" : s >= 45 ? "equilibrada" : s >= 30 ? "un área por desarrollar" : "un verdadero punto de crecimiento"),
  fr: (s) => (s >= 70 ? "un atout net" : s >= 55 ? "une compétence solide" : s >= 45 ? "équilibrée" : s >= 30 ? "un point à développer" : "un vrai axe de progrès"),
};

const INSIGHT: Record<Loc, (n: number, top: string, topBand: string, grow: string) => string> = {
  en: (n, top, topBand, grow) =>
    `Woven across ${n} communication ${n === 1 ? "test" : "tests"}, your standout is ${top} — ${topBand}. The skill with the most room to grow is ${grow}. Communication skills are learnable: small, deliberate practice in your growth edge compounds across every relationship.`,
  es: (n, top, topBand, grow) =>
    `Entretejido a partir de ${n} ${n === 1 ? "prueba" : "pruebas"} de comunicación, tu punto fuerte es ${top}: ${topBand}. La habilidad con más margen de mejora es ${grow}. Las habilidades comunicativas se aprenden: una práctica pequeña y deliberada en tu punto de crecimiento se multiplica en cada relación.`,
  fr: (n, top, topBand, grow) =>
    `Tissé à partir de ${n} ${n === 1 ? "test" : "tests"} de communication, votre point fort est ${top} — ${topBand}. La compétence avec le plus de marge de progression est ${grow}. Les compétences de communication s'apprennent : une pratique modeste et délibérée sur votre axe de progrès se répercute sur chaque relation.`,
};

/** Build the cross-context communication portrait, or null if no comm instrument
 *  has been taken. */
export function analyzeCommunication(
  entries: { instrument: Instrument; result: AssessmentResult }[],
  opts: { locale?: string } = {},
): CommunicationPortrait | null {
  const loc = cLoc(opts.locale);
  const byId = new Map(entries.map((e) => [e.instrument.id, e] as const));
  const present = COMM_INSTRUMENT_IDS.filter((id) => byId.has(id));
  if (!present.length) return null;

  const themes: CommTheme[] = [];
  for (const t of THEMES) {
    // Aggregate each contributing instrument's scales into one per-instrument view,
    // so an instrument with two relevant scales doesn't double-count.
    const perInst = new Map<string, { num: number; den: number }>();
    for (const s of t.sources) {
      const e = byId.get(s.inst);
      const sc = e?.result.scales[s.scale];
      if (!sc) continue;
      const pos = s.dir === 1 ? sc.normalized : 100 - sc.normalized;
      const cur = perInst.get(s.inst) ?? { num: 0, den: 0 };
      cur.num += pos * s.w;
      cur.den += s.w;
      perInst.set(s.inst, cur);
    }
    if (!perInst.size) continue;
    let sum = 0;
    const sources: CommThemeSource[] = [];
    for (const [instId, agg] of perInst) {
      sum += agg.num / agg.den;
      const inst = getInstrument(instId);
      if (inst) sources.push({ instrumentId: instId, instrumentName: localizeInstrument(inst, loc).shortName });
    }
    const score = Math.round(sum / perInst.size);
    themes.push({ id: t.id, name: t.name[loc], score, band: BAND[loc](score), lowLabel: t.low[loc], highLabel: t.high[loc], sources });
  }
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

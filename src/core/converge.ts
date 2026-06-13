import type { AssessmentResult, Instrument } from "./types";
import { getInstrument } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";

/**
 * Cross-test construct convergence — the platform's meta-intelligence.
 *
 * Most tools score each assessment in isolation. This reads across everything a
 * person has taken and cross-validates the deep traits that many instruments
 * measure in their own language: it aggregates each instrument's view of, say,
 * Extraversion, then asks whether the tests AGREE (a high-confidence read) or
 * DISAGREE (a genuine nuance worth reflecting on). Pure, deterministic, locale
 * aware, and decoupled from the synthesis layer to avoid import cycles.
 *
 * Only Likert/dimensional scales contribute — categorical "vote-share" formats
 * (DISC, VARK, Love Languages…) aren't on a comparable continuous trait axis.
 */

type Loc = "en" | "es" | "fr";
const cLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

export interface ConstructSource {
  instrumentId: string;
  instrumentName: string;
  scaleName: string;
  /** 0..100, direction-adjusted so high = high construct. */
  position: number;
}
export interface ConstructReading {
  id: string;
  name: string;
  lowLabel: string;
  highLabel: string;
  /** Weighted mean position across instruments, 0..100. */
  position: number;
  /** Pole-aware band phrase, e.g. "strongly Extraverted". */
  band: string;
  /** 0..1 — how much the instruments agree. */
  agreement: number;
  convergent: boolean;
  divergent: boolean;
  sources: ConstructSource[];
  insight: string;
}
export interface ConvergenceResult {
  readings: ConstructReading[];
  topConvergent?: ConstructReading;
  topDivergent?: ConstructReading;
}

interface Src { inst: string; scale: string; dir: 1 | -1; w: number }
interface ConstructDef {
  id: string;
  name: Record<Loc, string>;
  low: Record<Loc, string>;
  high: Record<Loc, string>;
  sources: Src[];
}

const CONSTRUCTS: ConstructDef[] = [
  {
    id: "extraversion",
    name: { en: "Extraversion", es: "Extraversión", fr: "Extraversion" },
    low: { en: "Introverted", es: "Introvertido", fr: "Introverti" },
    high: { en: "Extraverted", es: "Extravertido", fr: "Extraverti" },
    sources: [
      { inst: "big-five-ipip50", scale: "E", dir: 1, w: 1 },
      { inst: "hexaco-24", scale: "X", dir: 1, w: 1 },
      { inst: "eysenck-pen", scale: "EXT", dir: 1, w: 1 },
      { inst: "jung-16-types", scale: "EI", dir: 1, w: 0.8 },
      { inst: "zkpq-alt5", scale: "SY", dir: 1, w: 0.8 },
      { inst: "emotional-intelligence", scale: "SS", dir: 1, w: 0.5 },
    ],
  },
  {
    id: "conscientiousness",
    name: { en: "Conscientiousness", es: "Responsabilidad", fr: "Conscience" },
    low: { en: "Spontaneous", es: "Espontáneo", fr: "Spontané" },
    high: { en: "Disciplined", es: "Disciplinado", fr: "Discipliné" },
    sources: [
      { inst: "big-five-ipip50", scale: "C", dir: 1, w: 1 },
      { inst: "hexaco-24", scale: "C", dir: 1, w: 1 },
      { inst: "jung-16-types", scale: "JP", dir: 1, w: 0.6 },
      { inst: "grit-resilience", scale: "PERS", dir: 1, w: 0.7 },
      { inst: "grit-resilience", scale: "CONS", dir: 1, w: 0.7 },
      { inst: "self-control-bscs", scale: "RESTRAINT", dir: 1, w: 0.8 },
      { inst: "self-control-bscs", scale: "DISCIPLINE", dir: 1, w: 0.8 },
      { inst: "tci-cloninger", scale: "PS", dir: 1, w: 0.5 },
      { inst: "procrastination-pps", scale: "PROC", dir: -1, w: 0.6 },
      { inst: "perfectionism-2f", scale: "STAND", dir: 1, w: 0.4 },
    ],
  },
  {
    id: "agreeableness",
    name: { en: "Agreeableness", es: "Amabilidad", fr: "Agréabilité" },
    low: { en: "Tough-minded", es: "De carácter firme", fr: "Au caractère ferme" },
    high: { en: "Warm", es: "Cálido", fr: "Chaleureux" },
    sources: [
      { inst: "big-five-ipip50", scale: "A", dir: 1, w: 1 },
      { inst: "hexaco-24", scale: "A", dir: 1, w: 1 },
      { inst: "jung-16-types", scale: "TF", dir: 1, w: 0.6 },
      { inst: "empathy-iri", scale: "EC", dir: 1, w: 0.7 },
      { inst: "emotional-intelligence", scale: "EM", dir: 1, w: 0.6 },
      { inst: "tci-cloninger", scale: "CO", dir: 1, w: 0.7 },
    ],
  },
  {
    id: "stability",
    name: { en: "Emotional Stability", es: "Estabilidad emocional", fr: "Stabilité émotionnelle" },
    low: { en: "Sensitive", es: "Sensible", fr: "Sensible" },
    high: { en: "Steady", es: "Estable", fr: "Posé" },
    sources: [
      { inst: "big-five-ipip50", scale: "N", dir: -1, w: 1 },
      { inst: "hexaco-24", scale: "E", dir: -1, w: 0.8 },
      { inst: "eysenck-pen", scale: "NEU", dir: -1, w: 1 },
      { inst: "emotional-intelligence", scale: "SR", dir: 1, w: 0.6 },
      { inst: "brief-resilience", scale: "RES", dir: 1, w: 0.8 },
      { inst: "worry-checkin", scale: "CALM", dir: 1, w: 0.7 },
      { inst: "worry-checkin", scale: "STDY", dir: 1, w: 0.7 },
      { inst: "mood-checkin", scale: "MOOD", dir: 1, w: 0.4 },
      { inst: "optimism-lotr", scale: "OPT", dir: 1, w: 0.4 },
      { inst: "optimism-lotr", scale: "PES", dir: -1, w: 0.4 },
      { inst: "tci-cloninger", scale: "HA", dir: -1, w: 0.6 },
      { inst: "zkpq-alt5", scale: "NANX", dir: -1, w: 0.7 },
      { inst: "perfectionism-2f", scale: "CONC", dir: -1, w: 0.6 },
    ],
  },
  {
    id: "openness",
    name: { en: "Openness", es: "Apertura", fr: "Ouverture" },
    low: { en: "Grounded", es: "Práctico", fr: "Pragmatique" },
    high: { en: "Curious", es: "Curioso", fr: "Curieux" },
    sources: [
      { inst: "big-five-ipip50", scale: "O", dir: 1, w: 1 },
      { inst: "hexaco-24", scale: "O", dir: 1, w: 1 },
      { inst: "jung-16-types", scale: "SN", dir: 1, w: 0.8 },
      { inst: "need-for-cognition", scale: "NFC", dir: 1, w: 0.7 },
      { inst: "curiosity-cei", scale: "STRETCH", dir: 1, w: 0.7 },
      { inst: "curiosity-cei", scale: "EMBRACE", dir: 1, w: 0.6 },
      { inst: "sensation-seeking", scale: "TAS", dir: 1, w: 0.3 },
    ],
  },
];

/* ── localized phrasing ─────────────────────────────────────────────────── */
const BAND = {
  en: { hi: (h: string) => `strongly ${h}`, leanHi: (h: string) => `leaning ${h}`, mid: "balanced", leanLo: (l: string) => `leaning ${l}`, lo: (l: string) => `strongly ${l}` },
  es: { hi: (h: string) => `marcadamente ${h.toLowerCase()}`, leanHi: (h: string) => `con tendencia a ${h.toLowerCase()}`, mid: "equilibrado", leanLo: (l: string) => `con tendencia a ${l.toLowerCase()}`, lo: (l: string) => `marcadamente ${l.toLowerCase()}` },
  fr: { hi: (h: string) => `nettement ${h.toLowerCase()}`, leanHi: (h: string) => `plutôt ${h.toLowerCase()}`, mid: "équilibré", leanLo: (l: string) => `plutôt ${l.toLowerCase()}`, lo: (l: string) => `nettement ${l.toLowerCase()}` },
};
function bandPhrase(pos: number, low: string, high: string, loc: Loc): string {
  const b = BAND[loc];
  if (pos >= 66) return b.hi(high);
  if (pos >= 56) return b.leanHi(high);
  if (pos > 44) return b.mid;
  if (pos > 34) return b.leanLo(low);
  return b.lo(low);
}

const INSIGHT = {
  en: {
    convExtreme: (n: number, band: string) => `${n} different tests agree — you come out ${band}. That's a high-confidence read.`,
    convMid: (n: number, name: string) => `Across ${n} tests you land near the middle on ${name} — a consistent, balanced read.`,
    diverge: (name: string, hi: string, hiInst: string, lo: string, loInst: string) => `Your ${name} reads differently depending on the lens: ${hiInst} sees you more ${hi.toLowerCase()}, while ${loInst} sees you more ${lo.toLowerCase()}. A nuance worth sitting with.`,
  },
  es: {
    convExtreme: (n: number, band: string) => `${n} pruebas distintas coinciden: resultas ${band}. Es una lectura de alta confianza.`,
    convMid: (n: number, name: string) => `En ${n} pruebas te sitúas cerca del centro en ${name}: una lectura coherente y equilibrada.`,
    diverge: (name: string, hi: string, hiInst: string, lo: string, loInst: string) => `Tu ${name} se lee distinto según la mirada: ${hiInst} te ve más ${hi.toLowerCase()}, mientras que ${loInst} te ve más ${lo.toLowerCase()}. Un matiz que vale la pena observar.`,
  },
  fr: {
    convExtreme: (n: number, band: string) => `${n} tests différents concordent — vous ressortez ${band}. Une lecture à haute confiance.`,
    convMid: (n: number, name: string) => `Sur ${n} tests, vous vous situez près du centre sur ${name} — une lecture cohérente et équilibrée.`,
    diverge: (name: string, hi: string, hiInst: string, lo: string, loInst: string) => `Votre ${name} se lit différemment selon l'angle : ${hiInst} vous voit plus ${hi.toLowerCase()}, tandis que ${loInst} vous voit plus ${lo.toLowerCase()}. Une nuance à méditer.`,
  },
};

/* ── engine ─────────────────────────────────────────────────────────────── */
export function analyzeConvergence(
  entries: { instrument: Instrument; result: AssessmentResult }[],
  opts: { locale?: string } = {},
): ConvergenceResult {
  const loc = cLoc(opts.locale);
  const byId = new Map<string, AssessmentResult>();
  for (const e of entries) byId.set(e.instrument.id, e.result);

  const readings: ConstructReading[] = [];
  for (const c of CONSTRUCTS) {
    // Aggregate each instrument's contributing scales into one per-instrument view.
    const perInst = new Map<string, { num: number; den: number; bestW: number; bestScale: string }>();
    for (const s of c.sources) {
      const res = byId.get(s.inst);
      const sc = res?.scales[s.scale];
      if (!sc) continue;
      const pos = s.dir === 1 ? sc.normalized : 100 - sc.normalized;
      const cur = perInst.get(s.inst) ?? { num: 0, den: 0, bestW: 0, bestScale: "" };
      cur.num += pos * s.w;
      cur.den += s.w;
      if (s.w > cur.bestW) { cur.bestW = s.w; cur.bestScale = s.scale; }
      perInst.set(s.inst, cur);
    }
    if (perInst.size < 2) continue; // convergence needs ≥2 instruments

    const sources: ConstructSource[] = [];
    let wsum = 0, psum = 0;
    for (const [instId, agg] of perInst) {
      const position = agg.num / agg.den;
      const inst = getInstrument(instId);
      if (!inst) continue;
      const li = localizeInstrument(inst, loc);
      const scaleName = li.scales.find((x) => x.id === agg.bestScale)?.name ?? li.shortName;
      sources.push({ instrumentId: instId, instrumentName: li.shortName, scaleName, position: Math.round(position) });
      wsum += agg.bestW;
      psum += position * agg.bestW;
    }
    if (sources.length < 2) continue;

    const position = psum / wsum;
    // Agreement from the (weight-blind) spread of instrument positions.
    const mean = sources.reduce((a, s) => a + s.position, 0) / sources.length;
    const variance = sources.reduce((a, s) => a + (s.position - mean) ** 2, 0) / sources.length;
    const spread = Math.sqrt(variance);
    const agreement = Math.max(0, Math.min(1, 1 - spread / 32));
    const convergent = agreement >= 0.66;
    const divergent = agreement < 0.5;

    const name = c.name[loc];
    const low = c.low[loc];
    const high = c.high[loc];
    const band = bandPhrase(position, low, high, loc);
    const sorted = [...sources].sort((a, b) => b.position - a.position);
    const hiInst = sorted[0];
    const loInst = sorted[sorted.length - 1];

    let insight: string;
    if (divergent) {
      insight = INSIGHT[loc].diverge(name, high, hiInst.instrumentName, low, loInst.instrumentName);
    } else if (Math.abs(position - 50) >= 16) {
      insight = INSIGHT[loc].convExtreme(sources.length, band);
    } else {
      insight = INSIGHT[loc].convMid(sources.length, name);
    }

    readings.push({
      id: c.id, name, lowLabel: low, highLabel: high,
      position: Math.round(position), band, agreement: Math.round(agreement * 100) / 100,
      convergent, divergent,
      sources: sorted,
      insight,
    });
  }

  return finalizeReadings(readings);
}

/** Per-construct coverage: how many of a user's tests measure it, whether they
 *  diverge, and which not-yet-taken instruments would add a fresh angle. Powers
 *  convergence-aware ("triangulating") recommendations. */
export interface ConstructGap {
  id: string;
  name: string;
  /** Distinct instruments the user has taken that measure this construct. */
  sources: number;
  divergent: boolean;
  /** Instrument ids that measure this construct but the user hasn't taken (priority order). */
  candidates: string[];
}
export function constructGaps(
  entries: { instrument: Instrument; result: AssessmentResult }[],
  opts: { locale?: string } = {},
): ConstructGap[] {
  const loc = cLoc(opts.locale);
  const done = new Set(entries.map((e) => e.instrument.id));
  const conv = analyzeConvergence(entries, { locale: loc });
  const divById = new Map(conv.readings.map((r) => [r.id, r.divergent]));
  const gaps: ConstructGap[] = [];
  for (const c of CONSTRUCTS) {
    const measuring = new Set<string>();
    const candidates: string[] = [];
    const seen = new Set<string>();
    for (const s of c.sources) {
      if (done.has(s.inst)) measuring.add(s.inst);
      else if (!seen.has(s.inst) && getInstrument(s.inst)) { seen.add(s.inst); candidates.push(s.inst); }
    }
    gaps.push({ id: c.id, name: c.name[loc], sources: measuring.size, divergent: divById.get(c.id) ?? false, candidates });
  }
  return gaps;
}

function finalizeReadings(readings: ConstructReading[]): ConvergenceResult {
  // Most striking first: agreement × distinctiveness.
  readings.sort((a, b) => (b.agreement * Math.abs(b.position - 50)) - (a.agreement * Math.abs(a.position - 50)));
  const topConvergent = [...readings].filter((r) => r.convergent && Math.abs(r.position - 50) >= 12).sort((a, b) => b.agreement * Math.abs(b.position - 50) - a.agreement * Math.abs(a.position - 50))[0];
  const topDivergent = [...readings].filter((r) => r.divergent).sort((a, b) => a.agreement - b.agreement)[0];
  return { readings, topConvergent, topDivergent };
}

import type { AssessmentResult, Instrument } from "./types";
import { getInstrument } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";
import { seedFrom } from "./prng";
import {
  analyzeWellbeing, wellbeingGrowthNudge, wellbeingDimension,
  WELLBEING_INSTRUMENT_IDS, type WellbeingPortrait,
} from "./wellsynth";
import { buildGrowthPlan, type GrowthPlan, type GrowthTarget } from "./improvement/plan";

/**
 * Wellbeing Coach — an agentic flow that turns the cross-test Wellbeing Portrait
 * into action, with no manual target-picking. It (1) reads everything the person
 * has taken, (2) finds their weakest flourishing dimension (the growth edge),
 * (3) drills into the instrument that best measures it and the exact scales that
 * move it, (4) assembles a focused, cited growth plan via the existing engine,
 * and (5) suggests the single best next test to see that dimension from a fresh
 * angle. When there isn't enough data yet, it routes to a couple of foundational
 * check-ins instead. Pure, deterministic, locale-aware.
 */

type WLoc = "en" | "es" | "fr";
const wLoc = (l?: string): WLoc => (l === "es" || l === "fr" ? l : "en");

export interface CoachPractice { title: string; cadence?: string; evidence?: string }
export interface WellbeingProgram {
  state: "ready" | "needs-data";
  /** Localized brief narrating the program. */
  narrative: string[];
  /** needs-data: a couple of foundational wellbeing tests to take first. */
  recommended: { id: string; name: string }[];
  portrait?: WellbeingPortrait;
  focusDimensionId?: string;
  focusDimensionName?: string;
  /** Localized band phrase of the focus dimension (e.g. "an area to nurture"). */
  focusBand?: string;
  /** The instrument the focused plan targets. */
  instrumentId?: string;
  instrumentName?: string;
  plan?: GrowthPlan;
  /** A not-yet-taken test that adds a fresh angle on the focus dimension. */
  freshLens?: { id: string; name: string } | null;
  /** One keystone practice per targeted scale, for a quick schedule. */
  practices: CoachPractice[];
}

/** Foundational wellbeing check-ins to seed a portrait, in priority order. */
const PRIORITY = ["perma-flourishing", "self-compassion-scs", "mindfulness-ffmq", "brief-resilience", "meaning-mlq"];

const STR: Record<WLoc, {
  needsData: (names: string) => string;
  needsData2: string;
  edge: (n: number, dim: string, band: string) => string;
  focus: (inst: string, dim: string) => string;
  fresh: (name: string, dim: string) => string;
  close: string;
}> = {
  en: {
    needsData: (names) => `Take a couple of quick wellbeing check-ins — like ${names} — and I'll build you a focused, personalized plan from what they reveal.`,
    needsData2: "Two or more give me enough to find your growth edge and target it precisely.",
    edge: (n, dim, band) => `Across your ${n} wellbeing ${n === 1 ? "check-in" : "check-ins"}, your growth edge is ${dim} — ${band}.`,
    focus: (inst, dim) => `Here's a focused plan built around your ${inst} results — the practices that most move ${dim}.`,
    fresh: (name, dim) => `To see ${dim} from a fresh angle, your best next test is ${name}.`,
    close: "Small and repeated beats big and rare — aim for a little, most days.",
  },
  es: {
    needsData: (names) => `Haz un par de check-ins rápidos de bienestar —como ${names}— y te construiré un plan enfocado y personalizado a partir de lo que revelen.`,
    needsData2: "Con dos o más tengo lo suficiente para encontrar tu punto de crecimiento y trabajarlo con precisión.",
    edge: (n, dim, band) => `En tus ${n} check-ins de bienestar, tu punto de crecimiento es ${dim}: ${band}.`,
    focus: (inst, dim) => `Aquí tienes un plan enfocado a partir de tus resultados de ${inst}: las prácticas que más mueven ${dim}.`,
    fresh: (name, dim) => `Para ver ${dim} desde otro ángulo, tu mejor próximo test es ${name}.`,
    close: "Pequeño y repetido gana a grande y ocasional: apunta a un poco, casi todos los días.",
  },
  fr: {
    needsData: (names) => `Faites quelques bilans de bien-être rapides — comme ${names} — et je vous construirai un plan ciblé et personnalisé à partir de ce qu'ils révèlent.`,
    needsData2: "Deux ou plus me suffisent pour trouver votre axe de progrès et le cibler précisément.",
    edge: (n, dim, band) => `Sur vos ${n} bilans de bien-être, votre axe de progrès est ${dim} — ${band}.`,
    focus: (inst, dim) => `Voici un plan ciblé bâti à partir de vos résultats ${inst} — les pratiques qui font le plus bouger ${dim}.`,
    fresh: (name, dim) => `Pour voir ${dim} sous un autre angle, votre meilleur prochain test est ${name}.`,
    close: "Petit et répété vaut mieux que grand et rare — visez un peu, presque chaque jour.",
  },
};

const clamp = (n: number) => Math.max(5, Math.min(95, Math.round(n)));

export function buildWellbeingProgram(
  entries: { instrument: Instrument; result: AssessmentResult }[],
  opts: { locale?: string; seed?: number } = {},
): WellbeingProgram {
  const loc = wLoc(opts.locale);
  const s = STR[loc];
  const taken = new Map(entries.map((e) => [e.instrument.id, e] as const));
  const portrait = analyzeWellbeing(entries, { locale: opts.locale });

  // Not enough wellbeing data yet → route to a couple of foundational check-ins.
  if (!portrait || !portrait.topGrowth) {
    const pick = [...PRIORITY, ...WELLBEING_INSTRUMENT_IDS].filter((id, i, a) => a.indexOf(id) === i && !taken.has(id) && getInstrument(id)).slice(0, 3);
    const recommended = pick.map((id) => ({ id, name: localizeInstrument(getInstrument(id)!, loc).name }));
    const names = recommended.map((r) => r.name).join(loc === "fr" ? " ou " : loc === "es" ? " o " : " or ");
    return { state: "needs-data", narrative: [s.needsData(names), s.needsData2], recommended, practices: [] };
  }

  const focus = portrait.topGrowth;
  const def = wellbeingDimension(focus.id);

  // Pick the taken instrument that contributes most weight to the focus dimension.
  let instrumentId: string | undefined;
  if (def) {
    const weight = new Map<string, number>();
    for (const src of def.sources) {
      if (taken.has(src.inst)) weight.set(src.inst, (weight.get(src.inst) ?? 0) + src.w);
    }
    instrumentId = [...weight.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  const freshNudge = wellbeingGrowthNudge(entries, { locale: opts.locale });
  const freshLens = freshNudge ? { id: freshNudge.instrumentId, name: localizeInstrument(getInstrument(freshNudge.instrumentId)!, loc).name } : null;

  // No taken instrument drives this dimension (rare) → portrait-only program.
  if (!instrumentId || !def) {
    const narrative = [s.edge(portrait.instrumentsUsed.length, focus.name, focus.band)];
    if (freshLens) narrative.push(s.fresh(freshLens.name, focus.name));
    narrative.push(s.close);
    return { state: "ready", narrative, recommended: [], portrait, focusDimensionId: focus.id, focusDimensionName: focus.name, focusBand: focus.band, freshLens, practices: [] };
  }

  const entry = taken.get(instrumentId)!;
  const inst = localizeInstrument(entry.instrument, loc);

  // Targets: drive every scale this instrument contributes to the dimension in
  // the healthier direction (grow the positive scales, soften the risk scales).
  const targets = new Map<string, GrowthTarget>();
  for (const src of def.sources) {
    if (src.inst !== instrumentId) continue;
    const sc = entry.result.scales[src.scale];
    if (!sc) continue;
    targets.set(src.scale, { scaleId: src.scale, target: clamp(src.dir === 1 ? sc.normalized + 14 : sc.normalized - 14) });
  }
  const seed = opts.seed ?? seedFrom(entry.result.responseFingerprint, "wellbeing-coach", focus.id);
  const plan = buildGrowthPlan(inst, entry.result, [...targets.values()], { seed });

  const practices: CoachPractice[] = plan.areas
    .map((a) => a.steps[0])
    .filter((st): st is NonNullable<typeof st> => Boolean(st))
    .map((st) => ({ title: st.title, cadence: st.cadence, evidence: st.evidence }));

  const instrumentsCount = portrait.instrumentsUsed.length;
  const narrative = [s.edge(instrumentsCount, focus.name, focus.band), s.focus(inst.shortName, focus.name)];
  if (freshLens && freshLens.id !== instrumentId) narrative.push(s.fresh(freshLens.name, focus.name));
  narrative.push(s.close);

  return {
    state: "ready",
    narrative,
    recommended: [],
    portrait,
    focusDimensionId: focus.id,
    focusDimensionName: focus.name,
    focusBand: focus.band,
    instrumentId,
    instrumentName: inst.name,
    plan,
    freshLens: freshLens && freshLens.id !== instrumentId ? freshLens : null,
    practices,
  };
}

export interface CoachNudge {
  focusDimensionName: string;
  focusBand: string;
  practice: CoachPractice;
  /** 1-based position in today's rotation, and the total practices in the program. */
  index: number;
  total: number;
}

/**
 * The proactive cadence: today's single practice from the Wellbeing Coach
 * program, rotating deterministically through the keystone practices day by day
 * (offset per person so two people aren't synced). Null until a portrait exists.
 * Powers a "today's practice" surface on the dashboard.
 */
export function coachNextPractice(
  entries: { instrument: Instrument; result: AssessmentResult }[],
  opts: { locale?: string; date?: Date } = {},
): CoachNudge | null {
  const program = buildWellbeingProgram(entries, { locale: opts.locale });
  if (program.state !== "ready" || !program.practices.length) return null;
  const date = opts.date ?? new Date();
  const dayNum = Math.floor(date.getTime() / 86400000);
  const offset = seedFrom("coach-cadence", entries.map((e) => e.result.responseFingerprint).join("|"));
  const total = program.practices.length;
  const index = (((dayNum + offset) % total) + total) % total;
  return {
    focusDimensionName: program.focusDimensionName ?? "",
    focusBand: program.focusBand ?? "",
    practice: program.practices[index],
    index: index + 1,
    total,
  };
}

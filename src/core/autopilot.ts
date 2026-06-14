import type { SynthEntry } from "./synthesis";
import { recommendNext, profileSpotlight } from "./recommend";
import { buildRoadmap } from "./roadmap";
import { analyzeConvergence } from "./converge";
import { getInstrument } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";

/**
 * Atlas Autopilot — an autonomous, agentic journey.
 *
 * The user delegates "what next" to the agent: it plans a personalized sequence
 * of assessments toward their goals, runs them one after another, narrates each
 * choice and a running insight, re-planning adaptively from the results so far,
 * and finishes by composing the integrated portrait. Pure orchestration over the
 * existing engines (roadmap → recommendations → convergence), locale-aware.
 */

type Loc = "en" | "es" | "fr";
const aLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

export interface AutopilotPick {
  instrumentId: string;
  /** Localized "why this next" line. */
  reason: string;
}

const PLAN_REASON: Record<Loc, string> = {
  en: "Next in your shared study plan.",
  es: "Siguiente en tu plan de estudio compartido.",
  fr: "La prochaine de votre plan d'étude partagé.",
};

/** The agent's next move. With an explicit `plan` (e.g. a study room's curriculum)
 *  it follows that; otherwise a goal-driven roadmap step, else the top
 *  recommendation; null when the journey is complete. */
export function autopilotNext(entries: SynthEntry[], focus: string[], opts: { locale?: string; plan?: string[] } = {}): AutopilotPick | null {
  const locale = opts.locale;
  const done = new Set(entries.map((e) => e.instrument.id));
  if (opts.plan && opts.plan.length) {
    const nextId = opts.plan.find((id) => !done.has(id) && getInstrument(id));
    return nextId ? { instrumentId: nextId, reason: PLAN_REASON[aLoc(locale)] } : null;
  }
  const rm = buildRoadmap(entries, focus, { locale });
  if (rm.nextStep && !done.has(rm.nextStep.instrumentId)) {
    return { instrumentId: rm.nextStep.instrumentId, reason: rm.nextStep.reason };
  }
  const rec = recommendNext(entries, { locale, limit: 5 }).find((r) => !done.has(r.instrument.id));
  if (rec) return { instrumentId: rec.instrument.id, reason: rec.reason };
  return null;
}

/** How many steps the agent commits to up front (kept light; it re-plans each step). */
export function autopilotLength(entries: SynthEntry[]): number {
  return Math.min(5, Math.max(3, 5 - entries.length));
}

export interface AgentBrief {
  step: number;
  total: number;
  eyebrow: string;
  heading: string;
  /** A running cross-test insight, or null early on. */
  insight: string | null;
  nextName: string;
  nextWhy: string;
  estMinutes: number;
  begin: string;
  pause: string;
}

const STR: Record<Loc, { eyebrow: string; heading: (s: number, t: number) => string; nextUp: string; begin: string; pause: string }> = {
  en: {
    eyebrow: "Atlas Autopilot",
    heading: (s, t) => (s >= t ? "Last one — then your full picture" : s === 1 ? "Your journey is underway" : `${s} done — building your picture`),
    nextUp: "Next up", begin: "Continue →", pause: "Pause autopilot",
  },
  es: {
    eyebrow: "Piloto automático de Atlas",
    heading: (s, t) => (s >= t ? "La última, y luego tu retrato completo" : s === 1 ? "Tu recorrido está en marcha" : `${s} hechas — construyendo tu retrato`),
    nextUp: "A continuación", begin: "Continuar →", pause: "Pausar el piloto",
  },
  fr: {
    eyebrow: "Pilote automatique d'Atlas",
    heading: (s, t) => (s >= t ? "La dernière — puis votre portrait complet" : s === 1 ? "Votre parcours est lancé" : `${s} faites — votre portrait se construit`),
    nextUp: "Ensuite", begin: "Continuer →", pause: "Mettre en pause",
  },
};

/** Compose the interstitial the agent shows between steps. */
export function agentBrief(entries: SynthEntry[], next: AutopilotPick, step: number, total: number, opts: { locale?: string } = {}): AgentBrief {
  const L = aLoc(opts.locale);
  const s = STR[L];
  const inst = getInstrument(next.instrumentId);
  const nextName = inst ? localizeInstrument(inst, L).name : next.instrumentId;

  // A running insight: prefer a cross-test convergence note once there are 2+ tests,
  // else the spotlight's standout-trait line.
  let insight: string | null = null;
  if (entries.length >= 2) {
    const c = analyzeConvergence(entries, { locale: opts.locale });
    insight = (c.topConvergent ?? c.topDivergent ?? c.readings[0])?.insight ?? null;
  }
  if (!insight) insight = profileSpotlight(entries, { locale: opts.locale })?.line ?? null;

  return {
    step, total,
    eyebrow: `${s.eyebrow} · ${step}/${total}`,
    heading: s.heading(step, total),
    insight,
    nextName,
    nextWhy: next.reason,
    estMinutes: inst?.estMinutes ?? 3,
    begin: s.begin,
    pause: s.pause,
  };
}

export const AUTOPILOT_NEXTUP: Record<Loc, string> = { en: "Next up", es: "A continuación", fr: "Ensuite" };
export const autopilotNextUp = (l?: string) => AUTOPILOT_NEXTUP[aLoc(l)];

import type { SynthEntry } from "./synthesis";
import { recommendNext, profileSpotlight } from "./recommend";
import { buildRoadmap } from "./roadmap";
import { analyzeConvergence, triangulationTarget } from "./converge";
import { getInstrument } from "./instruments";
import { isPublicJourneyEligibleInstrument } from "./catalogPolicy";
import { localizeInstrument } from "./instruments/i18n";
import {
  NO_EVIDENCE_CONSENT,
  autonomousEvidence,
  type EvidenceConsent,
  type EvidenceRecord,
} from "./evidence";

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
  evidenceTier: "actionable";
  /** Autopilot proposes; it never starts an assessment on the user's behalf. */
  requiresConfirmation: true;
  guardrail: string;
}

export interface AutopilotOptions {
  locale?: string;
  plan?: string[];
  evidence?: readonly EvidenceRecord<SynthEntry>[];
  consent?: EvidenceConsent;
}

const PLAN_REASON: Record<Loc, string> = {
  en: "Next in your shared study plan.",
  es: "Siguiente en tu plan de estudio compartido.",
  fr: "La prochaine de votre plan d'étude partagé.",
};

const AUTO_GUARDRAIL: Record<Loc, string> = {
  en: "A proposed next step based only on consented actionable evidence; you choose whether to continue.",
  es: "Un siguiente paso propuesto basado solo en evidencia accionable consentida; tú decides si continuar.",
  fr: "Une prochaine étape proposée uniquement à partir d'éléments actionnables autorisés ; vous choisissez de continuer ou non.",
};

const pick = (instrumentId: string, reason: string, locale?: string): AutopilotPick => ({
  instrumentId,
  reason,
  evidenceTier: "actionable",
  requiresConfirmation: true,
  guardrail: AUTO_GUARDRAIL[aLoc(locale)],
});

/** "Why" lines when the agent picks a cross-validating test on its own initiative. */
const TRI_REASON: Record<Loc, { divergent: (c: string) => string; single: (c: string) => string }> = {
  en: {
    divergent: (c) => `Your tests disagree on ${c} — this one breaks the tie from a fresh angle.`,
    single: (c) => `Your ${c} read rests on a single test — this confirms it from a new lens.`,
  },
  es: {
    divergent: (c) => `Tus pruebas no coinciden en ${c}: esta desempata desde otro ángulo.`,
    single: (c) => `Tu lectura de ${c} se apoya en una sola prueba: esta la confirma desde otra mirada.`,
  },
  fr: {
    divergent: (c) => `Vos tests divergent sur ${c} — celui-ci tranche sous un angle neuf.`,
    single: (c) => `Votre lecture de ${c} repose sur un seul test — celui-ci la confirme sous un autre angle.`,
  },
};

/** The agent's next move. With an explicit `plan` (e.g. a study room's curriculum)
 *  it follows that; otherwise a goal-driven roadmap step, else the top
 *  recommendation; null when the journey is complete. */
export function autopilotNext(
  entries: SynthEntry[],
  focus: string[],
  opts: AutopilotOptions = {},
): AutopilotPick | null {
  const locale = opts.locale;
  // Autopilot is autonomous by definition and therefore fails closed. The
  // legacy `entries` parameter remains for source compatibility but is not read
  // unless represented as policy-filtered evidence.
  void entries;
  const routedEntries = autonomousEvidence(
    opts.evidence ?? [],
    opts.consent ?? NO_EVIDENCE_CONSENT,
  ).allowed
    .filter((record) => record.payload)
    .map((record) => record.payload as SynthEntry);
  const done = new Set(routedEntries.map((e) => e.instrument.id));
  if (opts.plan && opts.plan.length) {
    const nextId = opts.plan.find((id) =>
      !done.has(id) &&
      isPublicJourneyEligibleInstrument(id) &&
      getInstrument(id),
    );
    return nextId ? pick(nextId, PLAN_REASON[aLoc(locale)], locale) : null;
  }
  const rm = buildRoadmap(routedEntries, focus, { locale });
  if (rm.nextStep && !done.has(rm.nextStep.instrumentId)) {
    return pick(rm.nextStep.instrumentId, rm.nextStep.reason, locale);
  }
  // Goal steps done — offer a cross-check for a contradicted or single-source
  // observation before a generic catalog choice.
  const tri = triangulationTarget(routedEntries, { locale });
  if (
    tri &&
    !done.has(tri.instrumentId) &&
    isPublicJourneyEligibleInstrument(tri.instrumentId)
  ) {
    return pick(tri.instrumentId, TRI_REASON[aLoc(locale)][tri.kind](tri.constructName), locale);
  }
  const rec = recommendNext(routedEntries, { locale, limit: 5 }).find((r) => !done.has(r.instrument.id));
  if (rec) return pick(rec.instrument.id, rec.reason, locale);
  return null;
}

export function autopilotNextFromEvidence(
  evidence: readonly EvidenceRecord<SynthEntry>[],
  consent: EvidenceConsent,
  focus: string[],
  opts: Omit<AutopilotOptions, "evidence" | "consent"> = {},
): AutopilotPick | null {
  return autopilotNext([], focus, { ...opts, evidence, consent });
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

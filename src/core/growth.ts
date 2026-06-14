import type { AssessmentResult, Instrument } from "./types";

/**
 * Growth over time — compare retakes of the same assessment to see how a person
 * is actually changing, and surface journey milestones. Because the platform
 * stores every take, retaking a test months later shows real movement against the
 * growth plan, not just a one-time snapshot.
 */

export interface ScaleDelta {
  scaleId: string;
  name: string;
  first: number; // 0..100
  latest: number;
  delta: number;
}

export interface RetakeComparison {
  instrumentId: string;
  instrumentName: string;
  takes: number;
  firstAt: string;
  latestAt: string;
  deltas: ScaleDelta[];
  biggestMover?: ScaleDelta;
  typeFirst?: string;
  typeLatest?: string;
}

export function compareTakes(
  instrument: Instrument,
  firstAt: string,
  earliest: AssessmentResult,
  latestAt: string,
  latest: AssessmentResult,
  takes: number,
): RetakeComparison {
  const deltas: ScaleDelta[] = instrument.scales
    .filter((s) => earliest.scales[s.id] && latest.scales[s.id])
    .map((s) => {
      const first = Math.round(earliest.scales[s.id].normalized);
      const latestN = Math.round(latest.scales[s.id].normalized);
      return { scaleId: s.id, name: s.name, first, latest: latestN, delta: latestN - first };
    });
  const biggestMover = [...deltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  return {
    instrumentId: instrument.id,
    instrumentName: instrument.name,
    takes,
    firstAt,
    latestAt,
    deltas,
    biggestMover,
    typeFirst: earliest.type?.code,
    typeLatest: latest.type?.code,
  };
}

export interface Milestone {
  icon: string;
  label: string;
  reached: boolean;
}

export function milestones(distinctCount: number, totalTakes: number, streakDays: number): Milestone[] {
  return [
    { icon: "🌱", label: "Took your first assessment", reached: totalTakes >= 1 },
    { icon: "🧭", label: "Unlocked your Integrated Self", reached: distinctCount >= 1 },
    { icon: "🗺️", label: "Explored 3 different tests", reached: distinctCount >= 3 },
    { icon: "🔄", label: "Retook a test to track change", reached: totalTakes > distinctCount },
    { icon: "🔥", label: "Built a 3-day streak", reached: streakDays >= 3 },
    { icon: "📚", label: "Completed 6 assessments", reached: distinctCount >= 6 },
    { icon: "🏆", label: "Completed all 12", reached: distinctCount >= 12 },
  ];
}

/* ── longitudinal change narrative (localized) ──────────────────────────── */
type GLoc = "en" | "es" | "fr";
const gLoc = (l?: string): GLoc => (l === "es" || l === "fr" ? l : "en");

const NARR: Record<GLoc, {
  steady: (n: number) => string;
  moved: (parts: string, n: number) => string;
  rose: (name: string, d: number) => string;
  fell: (name: string, d: number) => string;
  typeChange: (a: string, b: string) => string;
  tail: string;
  and: string;
}> = {
  en: {
    steady: (n) => `Across your ${n} takes, your profile held remarkably steady — your core hasn't shifted much, which is its own kind of self-knowledge.`,
    moved: (parts, n) => `Across your ${n} takes, ${parts}.`,
    rose: (name, d) => `your ${name} rose ${d} points`,
    fell: (name, d) => `your ${name} eased ${d} points`,
    typeChange: (a, b) => ` Your type even shifted from ${a} to ${b}.`,
    tail: " Personality is changeable — these are real movements you can keep steering.",
    and: "and",
  },
  es: {
    steady: (n) => `En tus ${n} intentos, tu perfil se mantuvo notablemente estable: tu núcleo apenas se ha movido, y eso también es autoconocimiento.`,
    moved: (parts, n) => `En tus ${n} intentos, ${parts}.`,
    rose: (name, d) => `tu ${name} subió ${d} puntos`,
    fell: (name, d) => `tu ${name} bajó ${d} puntos`,
    typeChange: (a, b) => ` Tu tipo incluso pasó de ${a} a ${b}.`,
    tail: " La personalidad cambia: estos son movimientos reales que puedes seguir guiando.",
    and: "y",
  },
  fr: {
    steady: (n) => `Sur vos ${n} passations, votre profil est resté remarquablement stable — votre noyau a peu bougé, et c'est aussi une forme de connaissance de soi.`,
    moved: (parts, n) => `Sur vos ${n} passations, ${parts}.`,
    rose: (name, d) => `votre ${name} a gagné ${d} points`,
    fell: (name, d) => `votre ${name} a baissé de ${d} points`,
    typeChange: (a, b) => ` Votre type est même passé de ${a} à ${b}.`,
    tail: " La personnalité évolue — ce sont de vrais mouvements que vous pouvez continuer à orienter.",
    and: "et",
  },
};

/** A plain-language summary of how a person changed across retakes of one test. */
export function changeNarrative(c: RetakeComparison, locale?: string): string {
  const s = NARR[gLoc(locale)];
  const movers = [...c.deltas].filter((d) => Math.abs(d.delta) >= 8).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 2);
  let body: string;
  if (!movers.length) {
    body = s.steady(c.takes);
  } else {
    const parts = movers.map((d) => (d.delta > 0 ? s.rose(d.name, d.delta) : s.fell(d.name, Math.abs(d.delta))));
    const joined = parts.length === 2 ? `${parts[0]} ${s.and} ${parts[1]}` : parts[0];
    body = s.moved(joined, c.takes);
  }
  const tc = c.typeFirst && c.typeLatest && c.typeFirst !== c.typeLatest ? s.typeChange(c.typeFirst, c.typeLatest) : "";
  return body + tc + s.tail;
}

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
  signal: "within-noise" | "possible-change" | "larger-observed-change";
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
  daysBetween: number | null;
  practiceEffectPossible: boolean;
  calibrationNote: string;
}

export function compareTakes(
  instrument: Instrument,
  firstAt: string,
  earliest: AssessmentResult,
  latestAt: string,
  latest: AssessmentResult,
  takes: number,
  opts: { noiseThreshold?: number; largerChangeThreshold?: number; practiceEffectDays?: number } = {},
): RetakeComparison {
  const noiseThreshold = Math.max(1, opts.noiseThreshold ?? 8);
  const largerChangeThreshold = Math.max(noiseThreshold + 1, opts.largerChangeThreshold ?? 15);
  const deltas: ScaleDelta[] = instrument.scales
    .filter((s) => earliest.scales[s.id] && latest.scales[s.id])
    .map((s) => {
      const first = Math.round(earliest.scales[s.id].normalized);
      const latestN = Math.round(latest.scales[s.id].normalized);
      const delta = latestN - first;
      const magnitude = Math.abs(delta);
      const signal = magnitude < noiseThreshold
        ? "within-noise" as const
        : magnitude < largerChangeThreshold
          ? "possible-change" as const
          : "larger-observed-change" as const;
      return { scaleId: s.id, name: s.name, first, latest: latestN, delta, signal };
    });
  const biggestMover = [...deltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  const firstMs = new Date(firstAt).getTime();
  const latestMs = new Date(latestAt).getTime();
  const daysBetween = Number.isFinite(firstMs) && Number.isFinite(latestMs)
    ? Math.max(0, Math.round((latestMs - firstMs) / 86_400_000))
    : null;
  const practiceEffectPossible = daysBetween != null && daysBetween < (opts.practiceEffectDays ?? 30);
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
    daysBetween,
    practiceEffectPossible,
    calibrationNote:
      "Differences between sittings can reflect context, measurement noise, remembering items, practice effects, or genuine change. Repeated, spaced observations are more informative.",
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
  practice: string;
  and: string;
}> = {
  en: {
    steady: (n) => `Across your ${n} takes, the observed differences stayed within the range where context and measurement noise can easily matter.`,
    moved: (parts, n) => `Across your ${n} takes, the latest observations show that ${parts}.`,
    rose: (name, d) => `${name} was ${d} points higher`,
    fell: (name, d) => `${name} was ${d} points lower`,
    typeChange: (a, b) => ` The categorical summary also changed from ${a} to ${b}; near a cutoff, small shifts can change that label.`,
    tail: " Treat this as evidence to revisit, not proof of a fixed trend; repeated observations across different contexts are more informative.",
    practice: " Because these takes were close together, familiarity with the items or practice effects may contribute.",
    and: "and",
  },
  es: {
    steady: (n) => `En tus ${n} intentos, las diferencias observadas quedaron dentro del rango donde el contexto y el ruido de medición pueden influir con facilidad.`,
    moved: (parts, n) => `En tus ${n} intentos, las observaciones más recientes muestran que ${parts}.`,
    rose: (name, d) => `${name} quedó ${d} puntos más alto`,
    fell: (name, d) => `${name} quedó ${d} puntos más bajo`,
    typeChange: (a, b) => ` El resumen categórico también cambió de ${a} a ${b}; cerca de un corte, pequeños cambios pueden alterar esa etiqueta.`,
    tail: " Tómalo como evidencia para revisar, no como prueba de una tendencia fija; las observaciones repetidas en distintos contextos informan más.",
    practice: " Como los intentos fueron cercanos, la familiaridad con los ítems o los efectos de práctica pueden contribuir.",
    and: "y",
  },
  fr: {
    steady: (n) => `Sur vos ${n} passations, les différences observées sont restées dans une zone où le contexte et le bruit de mesure peuvent facilement compter.`,
    moved: (parts, n) => `Sur vos ${n} passations, les observations les plus récentes montrent que ${parts}.`,
    rose: (name, d) => `${name} était supérieur de ${d} points`,
    fell: (name, d) => `${name} était inférieur de ${d} points`,
    typeChange: (a, b) => ` Le résumé catégoriel est aussi passé de ${a} à ${b} ; près d'un seuil, de petits écarts peuvent changer cette étiquette.`,
    tail: " Considérez cela comme un indice à revoir, pas comme la preuve d'une tendance figée ; des observations répétées dans différents contextes sont plus instructives.",
    practice: " Comme ces passations étaient rapprochées, la familiarité avec les items ou les effets d'entraînement peuvent contribuer.",
    and: "et",
  },
};

/** A plain-language summary of how a person changed across retakes of one test. */
export function changeNarrative(c: RetakeComparison, locale?: string): string {
  const s = NARR[gLoc(locale)];
  const movers = [...c.deltas]
    .filter((delta) => delta.signal !== "within-noise")
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 2);
  let body: string;
  if (!movers.length) {
    body = s.steady(c.takes);
  } else {
    const parts = movers.map((d) => (d.delta > 0 ? s.rose(d.name, d.delta) : s.fell(d.name, Math.abs(d.delta))));
    const joined = parts.length === 2 ? `${parts[0]} ${s.and} ${parts[1]}` : parts[0];
    body = s.moved(joined, c.takes);
  }
  const tc = c.typeFirst && c.typeLatest && c.typeFirst !== c.typeLatest ? s.typeChange(c.typeFirst, c.typeLatest) : "";
  const practice = c.practiceEffectPossible ? s.practice : "";
  return body + tc + practice + s.tail;
}

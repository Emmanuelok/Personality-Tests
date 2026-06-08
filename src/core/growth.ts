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

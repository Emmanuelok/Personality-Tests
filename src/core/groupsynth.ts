import {
  MIN_GROUP_AGGREGATE,
  consentedSharedScores,
  type MemberProgress,
} from "./collab";
import { wellbeingThemesFromScores } from "./wellsynth";
import { communicationThemesFromScores } from "./commsynth";

/**
 * Group portraits — the collective cross-context picture of a Study Together
 * room or team. Where collab.ts's groupPortrait aggregates one instrument at a
 * time, this synthesizes ACROSS instruments into the same five wellbeing
 * dimensions / communication competencies an individual sees, then averages
 * them across members. Each member's dimension scores are computed from their
 * shared scale snapshots (the same engine the solo portrait uses), so the group
 * reading and the personal reading speak the same language.
 *
 * Pure, deterministic, locale-aware. Aggregate output is suppressed until the
 * privacy cohort threshold is met.
 */

type GLoc = "en" | "es" | "fr";
const gLoc = (l?: string): GLoc => (l === "es" || l === "fr" ? l : "en");

export type GroupPortraitKind = "wellbeing" | "communication";

export interface GroupDimension {
  id: string;
  name: string;
  lowLabel: string;
  highLabel: string;
  /** Group mean across contributing members, 0..100. */
  mean: number;
  /** Aggregate bounds; contributor identities are deliberately not retained. */
  min: number;
  max: number;
  /** max − min: how widely the group varies here. */
  spread: number;
  /** Members who contributed a score to this dimension. */
  n: number;
}

export interface GroupPortrait {
  kind: GroupPortraitKind;
  dimensions: GroupDimension[];
  /** Dimension with the highest group mean (a collective strength). */
  topShared?: GroupDimension;
  /** Dimension with the widest member-to-member spread (most diverse). */
  widest?: GroupDimension;
  /** Localized observations about the group. */
  insights: string[];
  /** Members who contributed any dimension. */
  members: number;
}

const GS: Record<GLoc, {
  shared: (dim: string, mean: number) => string;
  differ: (dim: string, loV: number, hiV: number) => string;
}> = {
  en: {
    shared: (dim, mean) => `As a group, your strongest shared dimension is ${dim} (group average ${mean}/100) — a collective strength to build on together.`,
    differ: (dim, loV, hiV) => `Your widest aggregate range is on ${dim} (${loV}–${hiV}). Individual contributors stay private.`,
  },
  es: {
    shared: (dim, mean) => `Como grupo, vuestra dimensión compartida más fuerte es ${dim} (media del grupo ${mean}/100): una fortaleza colectiva sobre la que construir juntos.`,
    differ: (dim, loV, hiV) => `El rango agregado más amplio está en ${dim} (${loV}–${hiV}). Las contribuciones individuales siguen siendo privadas.`,
  },
  fr: {
    shared: (dim, mean) => `En tant que groupe, votre dimension partagée la plus forte est ${dim} (moyenne du groupe ${mean}/100) — une force collective sur laquelle bâtir ensemble.`,
    differ: (dim, loV, hiV) => `La plage agrégée la plus large concerne ${dim} (${loV}–${hiV}). Les contributions individuelles restent privées.`,
  },
};

interface MemberDims { name: string; dims: { id: string; name: string; lowLabel: string; highLabel: string; score: number }[] }

function build(kind: GroupPortraitKind, perMember: MemberDims[], loc: GLoc): GroupPortrait | null {
  // Collect each dimension's per-member values, preserving first-seen order.
  const order: string[] = [];
  const map = new Map<string, { name: string; lowLabel: string; highLabel: string; vals: number[] }>();
  for (const m of perMember) {
    for (const d of m.dims) {
      let agg = map.get(d.id);
      if (!agg) { agg = { name: d.name, lowLabel: d.lowLabel, highLabel: d.highLabel, vals: [] }; map.set(d.id, agg); order.push(d.id); }
      agg.vals.push(d.score);
    }
  }
  const dimensions: GroupDimension[] = [];
  for (const id of order) {
    const a = map.get(id)!;
    if (a.vals.length < MIN_GROUP_AGGREGATE) continue;
    const mean = Math.round(a.vals.reduce((sum, value) => sum + value, 0) / a.vals.length);
    const sorted = [...a.vals].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    dimensions.push({ id, name: a.name, lowLabel: a.lowLabel, highLabel: a.highLabel, mean, min, max, spread: max - min, n: a.vals.length });
  }
  if (!dimensions.length) return null;

  const topShared = [...dimensions].sort((a, b) => b.mean - a.mean)[0];
  const widest = [...dimensions].sort((a, b) => b.spread - a.spread)[0];
  const s = GS[loc];
  const insights: string[] = [];
  insights.push(s.shared(topShared.name, topShared.mean));
  if (widest && widest.id !== topShared.id && widest.spread >= 18) {
    insights.push(s.differ(widest.name, widest.min, widest.max));
  }
  return { kind, dimensions, topShared, widest, insights, members: perMember.length };
}

/** The group's collective wellbeing portrait (five flourishing dimensions),
 *  averaged across members who have shared scores. */
export function groupWellbeingPortrait(members: MemberProgress[], opts: { locale?: string } = {}): GroupPortrait | null {
  const loc = gLoc(opts.locale);
  const perMember = members
    .map((member) => ({ member, scores: consentedSharedScores(member) }))
    .filter((entry): entry is { member: MemberProgress; scores: Record<string, Record<string, number>> } => Boolean(entry.scores))
    .map(({ member, scores }) => ({ name: member.name, dims: wellbeingThemesFromScores(scores, { locale: loc }).map((t) => ({ id: t.id, name: t.name, lowLabel: t.lowLabel, highLabel: t.highLabel, score: t.score })) }))
    .filter((pm) => pm.dims.length);
  if (perMember.length < MIN_GROUP_AGGREGATE) return null;
  return build("wellbeing", perMember, loc);
}

/** The group's collective communication portrait (five competencies), averaged
 *  across members who have shared scores. */
export function groupCommunicationPortrait(members: MemberProgress[], opts: { locale?: string } = {}): GroupPortrait | null {
  const loc = gLoc(opts.locale);
  const perMember = members
    .map((member) => ({ member, scores: consentedSharedScores(member) }))
    .filter((entry): entry is { member: MemberProgress; scores: Record<string, Record<string, number>> } => Boolean(entry.scores))
    .map(({ member, scores }) => ({ name: member.name, dims: communicationThemesFromScores(scores, { locale: loc }).map((t) => ({ id: t.id, name: t.name, lowLabel: t.lowLabel, highLabel: t.highLabel, score: t.score })) }))
    .filter((pm) => pm.dims.length);
  if (perMember.length < MIN_GROUP_AGGREGATE) return null;
  return build("communication", perMember, loc);
}

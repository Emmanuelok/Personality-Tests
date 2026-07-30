import type { SynthEntry } from "./synthesis";
import { INSTRUMENTS } from "./instruments";

/**
 * Milestones — meaningful, motivating markers along a person's journey.
 *
 * Pure and deterministic from what they've completed (assessments, categories
 * explored, streak, cognition). Achieved milestones celebrate progress; the
 * nearest locked one gives a concrete next target. Fully localized (en/es/fr).
 */

export interface Milestone {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  achieved: boolean;
  /** 0..1 toward the target. */
  progress: number;
  /** e.g. "3 / 5". */
  label: string;
}

type Loc = "en" | "es" | "fr";
const loc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

interface Ctx {
  tests: number;
  categories: number;
  cognition: number;
  relationships: number;
  shadow: number;
  streak: number;
  total: number;
}

interface MDef {
  id: string;
  icon: string;
  title: Record<Loc, string>;
  blurb: Record<Loc, string>;
  value: (c: Ctx) => number;
  target: (c: Ctx) => number;
  /** Optional unit appended to the "v / t" label. */
  unit?: Record<Loc, string>;
}

const DEFS: MDef[] = [
  {
    id: "first-light", icon: "✦",
    title: { en: "First Light", es: "Primera luz", fr: "Première lueur" },
    blurb: { en: "Complete your first assessment.", es: "Completa tu primera evaluación.", fr: "Terminez votre première évaluation." },
    value: (c) => c.tests, target: () => 1,
  },
  {
    id: "triangulated", icon: "△",
    title: { en: "Triangulated", es: "Triangulado", fr: "Triangulé" },
    blurb: { en: "Complete three assessments.", es: "Completa tres evaluaciones.", fr: "Terminez trois évaluations." },
    value: (c) => c.tests, target: () => 3,
  },
  {
    id: "wide-explorer", icon: "🧭",
    title: { en: "Wide Explorer", es: "Gran explorador", fr: "Grand explorateur" },
    blurb: { en: "Explore three different themes.", es: "Explora tres temas distintos.", fr: "Explorez trois thèmes différents." },
    value: (c) => c.categories, target: () => 3,
    unit: { en: "themes", es: "temas", fr: "thèmes" },
  },
  {
    id: "self-integrated", icon: "❖",
    title: { en: "Self-Integrated", es: "Yo integrado", fr: "Soi intégré" },
    blurb: { en: "Reach a rich, woven Integrated Self (5 assessments).", es: "Alcanza un Yo Integrado rico (5 evaluaciones).", fr: "Atteignez un Soi intégré riche (5 évaluations)." },
    value: (c) => c.tests, target: () => 5,
  },
  {
    id: "heart-mapped", icon: "💞",
    title: { en: "Heart Mapped", es: "Corazón mapeado", fr: "Cœur cartographié" },
    blurb: { en: "Explore how you love and relate.", es: "Explora cómo amas y te relacionas.", fr: "Explorez comment vous aimez et vous liez." },
    value: (c) => c.relationships, target: () => 1,
  },
  {
    id: "mind-mapped", icon: "🧠",
    title: { en: "Mind Mapped", es: "Mente mapeada", fr: "Esprit cartographié" },
    blurb: { en: "Take a cognitive or performance test.", es: "Haz una prueba cognitiva o de rendimiento.", fr: "Passez un test cognitif ou de performance." },
    value: (c) => c.cognition, target: () => 1,
  },
  {
    id: "into-shadow", icon: "🌑",
    title: { en: "Into the Shadow", es: "Hacia la sombra", fr: "Vers l'ombre" },
    blurb: { en: "Face a darker, riskier side of personality.", es: "Enfréntate a un lado más oscuro de la personalidad.", fr: "Affrontez un côté plus sombre de la personnalité." },
    value: (c) => c.shadow, target: () => 1,
  },
  {
    id: "devoted", icon: "🔥",
    title: { en: "Devoted", es: "Constante", fr: "Assidu" },
    blurb: { en: "Return seven days in a row.", es: "Vuelve siete días seguidos.", fr: "Revenez sept jours d'affilée." },
    value: (c) => c.streak, target: () => 7,
    unit: { en: "days", es: "días", fr: "jours" },
  },
  {
    id: "deep-diver", icon: "🌊",
    title: { en: "Deep Diver", es: "Buceador profundo", fr: "Plongeur" },
    blurb: { en: "Complete ten assessments.", es: "Completa diez evaluaciones.", fr: "Terminez dix évaluations." },
    value: (c) => c.tests, target: () => 10,
  },
  {
    id: "cartographer", icon: "🗺",
    title: { en: "Cartographer", es: "Cartógrafo", fr: "Cartographe" },
    blurb: { en: "Complete twenty assessments.", es: "Completa veinte evaluaciones.", fr: "Terminez vingt évaluations." },
    value: (c) => c.tests, target: () => 20,
  },
  {
    id: "atlas-complete", icon: "👑",
    title: { en: "Atlas Complete", es: "Atlas completo", fr: "Atlas complet" },
    blurb: { en: "Explore the entire atlas.", es: "Explora todo el atlas.", fr: "Explorez tout l'atlas." },
    value: (c) => c.tests, target: (c) => c.total,
  },
];

const RELATIONSHIP_IDS = new Set(["attachment-styles", "love-languages", "conflict-style"]);
const SHADOW_IDS = new Set(["dark-triad-18", "dark-tetrad-18", "pid5-maladaptive"]);

export interface MilestoneSummary {
  all: Milestone[];
  achieved: Milestone[];
  /** The nearest not-yet-achieved milestone with the most progress — your next target. */
  next: Milestone | null;
  achievedCount: number;
  total: number;
}

export function computeMilestones(
  entries: SynthEntry[],
  opts: { streakDays?: number; cognitiveCount?: number; locale?: string } = {},
): MilestoneSummary {
  const L = loc(opts.locale);
  const ids = new Set(entries.map((e) => e.instrument.id));
  const cats = new Set(entries.map((e) => e.instrument.category));
  const ctx: Ctx = {
    tests: ids.size,
    categories: cats.size,
    cognition: opts.cognitiveCount ?? 0,
    relationships: entries.filter((e) => RELATIONSHIP_IDS.has(e.instrument.id)).length,
    shadow: entries.filter((e) => SHADOW_IDS.has(e.instrument.id)).length,
    streak: opts.streakDays ?? 0,
    total: INSTRUMENTS.length,
  };

  const all: Milestone[] = DEFS.map((d) => {
    const v = d.value(ctx);
    const t = d.target(ctx);
    const achieved = v >= t;
    const unit = d.unit ? ` ${d.unit[L]}` : "";
    return {
      id: d.id,
      icon: d.icon,
      title: d.title[L],
      blurb: d.blurb[L],
      achieved,
      progress: t > 0 ? Math.min(1, v / t) : 0,
      label: achieved ? `${t} / ${t}${unit}` : `${Math.min(v, t)} / ${t}${unit}`,
    };
  });

  const achieved = all.filter((m) => m.achieved);
  const locked = all.filter((m) => !m.achieved);
  // Next target: the locked milestone closest to completion (then by smallest target).
  locked.sort((a, b) => b.progress - a.progress);
  return {
    all,
    achieved,
    next: locked[0] ?? null,
    achievedCount: achieved.length,
    total: all.length,
  };
}

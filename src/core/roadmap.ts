import type { SynthEntry } from "./synthesis";
import { getInstrument } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";
import { recommendNext } from "./recommend";

/**
 * Personalized roadmap — turns a user's goals into an ordered journey.
 *
 * Onboarding captures what someone wants (understand themselves, grow, improve
 * relationships, career, wellbeing). This composes that into a concrete, ordered
 * path of assessments: a foundation, a goal-tailored core, and adaptive depth —
 * each step marked done / current / upcoming, with live progress. The dashboard
 * and onboarding preview both render from this single, deterministic engine.
 */

export type GoalKey = "self" | "grow" | "relationships" | "career" | "wellbeing" | "curious";

export interface RoadmapStep {
  instrumentId: string;
  name: string;
  shortName: string;
  category: string;
  estMinutes: number;
  done: boolean;
  /** The first not-yet-done step — the user's actionable next move. */
  current: boolean;
  /** Localized one-liner: why this step is on your path. */
  reason: string;
}

export interface Roadmap {
  goals: GoalKey[];
  steps: RoadmapStep[];
  doneCount: number;
  total: number;
  /** 0..100 completion of the roadmap. */
  pct: number;
  nextStep: RoadmapStep | null;
}

type Loc = "en" | "es" | "fr";
const loc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

/** Map free-text onboarding focus labels (any language) to canonical goal keys. */
export function goalKeys(focus: string[]): GoalKey[] {
  const out: GoalKey[] = [];
  const add = (k: GoalKey) => { if (!out.includes(k)) out.push(k); };
  for (const raw of focus) {
    const f = raw.toLowerCase();
    if (/relationship|relacion|relation|amor|love|pareja/.test(f)) add("relationships");
    else if (/career|work|carrera|trabajo|carrière|travail/.test(f)) add("career");
    else if (/emotional|wellbeing|bienestar|émotion|bien-être|emocional/.test(f)) add("wellbeing");
    else if (/grow|improve|crec|mejor|grandir|progress/.test(f)) add("grow");
    else if (/curio/.test(f)) add("curious");
    else if (/understand|myself|conoc|comprend|moi|mí/.test(f)) add("self");
  }
  return out.length ? out : ["self"];
}

/** Goal → the instruments that most directly serve it (in priority order). */
const GOAL_MAP: Record<GoalKey, string[]> = {
  self: ["jung-16-types", "enneagram-9", "via-24"],
  grow: ["grit-resilience", "self-efficacy-gse", "self-control-bscs", "procrastination-pps", "mindset-dweck", "communication-style"],
  relationships: ["attachment-styles", "love-languages", "conflict-style", "couple-communication"],
  career: ["riasec-careers", "disc-4", "career-anchors", "team-communication"],
  wellbeing: ["emotional-intelligence", "emotion-regulation-erq", "gratitude-gq6", "perma-flourishing", "brief-resilience", "money-scripts"],
  curious: ["jung-16-types", "via-24", "vark-learning"],
};

const FOUNDATION = "big-five-ipip50";

const FOUNDATION_REASON: Record<Loc, string> = {
  en: "Start here — the cornerstone that maps your whole personality.",
  es: "Empieza aquí: la piedra angular que mapea toda tu personalidad.",
  fr: "Commencez ici — la pierre angulaire qui cartographie toute votre personnalité.",
};

const GOAL_REASON: Record<GoalKey, Record<Loc, string>> = {
  self: {
    en: "Builds the core picture of who you are.",
    es: "Construye el retrato esencial de quién eres.",
    fr: "Bâtit le portrait essentiel de qui vous êtes.",
  },
  grow: {
    en: "Targets the traits behind real, lasting change.",
    es: "Apunta a los rasgos detrás del cambio real y duradero.",
    fr: "Vise les traits derrière un changement réel et durable.",
  },
  relationships: {
    en: "Reveals how you bond, love, and handle friction.",
    es: "Revela cómo te vinculas, amas y manejas la fricción.",
    fr: "Révèle comment vous vous liez, aimez et gérez les tensions.",
  },
  career: {
    en: "Points to the work where you'll truly thrive.",
    es: "Señala el trabajo donde de verdad prosperarás.",
    fr: "Indique le travail où vous vous épanouirez vraiment.",
  },
  wellbeing: {
    en: "Tends to your inner world and resilience.",
    es: "Cuida tu mundo interior y tu resiliencia.",
    fr: "Prend soin de votre monde intérieur et de votre résilience.",
  },
  curious: {
    en: "A fascinating, off-the-beaten-path look at yourself.",
    es: "Una mirada fascinante y poco común sobre ti.",
    fr: "Un regard fascinant et original sur vous-même.",
  },
};

/**
 * Compose the roadmap. Membership is deterministic from goals (so progress only
 * ever climbs), with the tail topped up by the live recommendation engine.
 */
export function buildRoadmap(
  entries: SynthEntry[],
  focus: string[],
  opts: { locale?: string; length?: number } = {},
): Roadmap {
  const L = loc(opts.locale);
  const length = opts.length ?? 7;
  const goals = goalKeys(focus);
  const done = new Set(entries.map((e) => e.instrument.id));

  // 1. Ordered membership: foundation, then goal-core (round-robin across goals
  //    so multi-goal users get breadth), then adaptive depth fill.
  const order: { id: string; reason: Record<Loc, string> | string }[] = [];
  const seen = new Set<string>();
  const push = (id: string, reason: Record<Loc, string> | string) => {
    if (seen.has(id) || !getInstrument(id)) return;
    seen.add(id);
    order.push({ id, reason });
  };

  push(FOUNDATION, FOUNDATION_REASON);
  const lists = goals.map((g) => ({ g, ids: [...GOAL_MAP[g]] }));
  let added = true;
  while (added) {
    added = false;
    for (const { g, ids } of lists) {
      const id = ids.shift();
      if (id) { push(id, GOAL_REASON[g]); added = true; }
    }
  }
  if (order.length < length) {
    for (const r of recommendNext(entries, { locale: L, limit: 12 })) {
      if (order.length >= length) break;
      push(r.instrument.id, r.reason);
    }
  }

  // 2. Realize steps with localized names + done/current flags.
  const trimmed = order.slice(0, length);
  let currentAssigned = false;
  const steps: RoadmapStep[] = trimmed.map((o) => {
    const inst = localizeInstrument(getInstrument(o.id)!, L);
    const isDone = done.has(o.id);
    const isCurrent = !isDone && !currentAssigned;
    if (isCurrent) currentAssigned = true;
    return {
      instrumentId: o.id,
      name: inst.name,
      shortName: inst.shortName,
      category: inst.category,
      estMinutes: inst.estMinutes,
      done: isDone,
      current: isCurrent,
      reason: typeof o.reason === "string" ? o.reason : o.reason[L],
    };
  });

  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  return {
    goals,
    steps,
    doneCount,
    total,
    pct: total ? Math.round((doneCount / total) * 100) : 0,
    nextStep: steps.find((s) => s.current) ?? null,
  };
}

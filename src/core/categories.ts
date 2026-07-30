/**
 * Thematic categories that organize the instrument catalog by construct.
 * Every instrument declares a `category` id from this list.
 */

export interface Category {
  id: string;
  name: string;
  blurb: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "core",
    name: "Core Personality",
    blurb: "Broad, validated trait models that map the whole of your personality.",
    icon: "🧠",
  },
  {
    id: "types",
    name: "Types & Styles",
    blurb: "Typologies that sort your patterns of energy, thinking, and behavior into recognizable styles.",
    icon: "🎭",
  },
  {
    id: "relationships",
    name: "Relationships & Love",
    blurb: "How you bond, connect, and love — and how well you fit with the people who matter.",
    icon: "💞",
  },
  {
    id: "communication",
    name: "Communication & Conflict",
    blurb: "How you express, listen, and work through friction — with partners, teammates, and everyone.",
    icon: "💬",
  },
  {
    id: "strengths",
    name: "Strengths, Values & Growth",
    blurb: "What you're great at, what you care about, and what keeps you moving forward.",
    icon: "🌱",
  },
  {
    id: "career",
    name: "Career & Calling",
    blurb: "The work, environments, and roles where you'll do your best and feel most alive.",
    icon: "💼",
  },
  {
    id: "emotional",
    name: "Emotional Intelligence & Wellbeing",
    blurb: "Your inner world — emotions, resilience, and the skills behind a good life.",
    icon: "🫀",
  },
  {
    id: "wellbeing",
    name: "Stress & Wellbeing",
    blurb: "Stress, coping, burnout, mood, and flourishing — an honest read on how you're really doing.",
    icon: "🌿",
  },
  {
    id: "learning",
    name: "Learning & Thinking",
    blurb: "How you take in, process, and act on information — popular models, held to honest scientific scrutiny.",
    icon: "📖",
  },
  {
    id: "mind",
    name: "Mind & Neurodivergence",
    blurb: "Educational self-screens for how your brain is wired. Insight, never a diagnosis.",
    icon: "🧩",
  },
  {
    id: "focused",
    name: "Focused Scales",
    blurb: "One construct, measured well — research staples that zoom in on a single, powerful trait.",
    icon: "🎯",
  },
  {
    id: "shadow",
    name: "Shadow & Risk",
    blurb: "The darker, riskier sides of normal personality — seen honestly, for growth.",
    icon: "🌑",
  },
];

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));
export function getCategory(id: string): Category | undefined {
  return BY_ID.get(id);
}

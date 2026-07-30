import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { mcclellandTypeStrings, type RankedStyleBundle } from "./i18n";

/**
 * McClelland's Needs (Achievement · Affiliation · Power).
 *
 * David McClelland's theory of acquired needs holds that three learned motives —
 * the need for Achievement, Affiliation, and Power — drive much of what we pursue,
 * with one usually dominant. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("AC1", "I set challenging goals and feel driven to meet them.", "ACH"),
  it("AC2", "I love measuring my progress and beating my own best.", "ACH"),
  it("AC3", "Personal accomplishment motivates me more than money or status.", "ACH"),
  it("AC4", "I prefer tasks with clear standards where I can excel.", "ACH"),
  it("AF1", "Warm, close relationships matter more to me than winning or leading.", "AFF"),
  it("AF2", "I go out of my way to be liked and to belong.", "AFF"),
  it("AF3", "I feel best when I'm connected and in harmony with others.", "AFF"),
  it("AF4", "I dislike conflict and work hard to keep relationships smooth.", "AFF"),
  it("PW1", "I'm energized by influencing people and shaping outcomes.", "POW"),
  it("PW2", "I seek positions where I can direct others and make an impact.", "POW"),
  it("PW3", "Having an effect on the world matters a great deal to me.", "POW"),
  it("PW4", "I enjoy being in charge and persuading others to my view.", "POW"),
];

/** Canonical, language-agnostic motive codes. */
const CODE_EN: Record<string, string> = { ACH: "Achievement", AFF: "Affiliation", POW: "Power" };

/** English default; es/fr live in core/instruments/i18n.ts (mcclellandTypeStrings). */
const MCCLELLAND_TYPE_EN: RankedStyleBundle = {
  meta: {
    ACH: { name: "Achievement", title: "The Achiever", desc: "mastery, goals, excellence", summary: "Your dominant motive is Achievement — you're driven to set challenging goals, measure progress, and excel. You thrive on personal accomplishment and clear standards of success." },
    AFF: { name: "Affiliation", title: "The Connector", desc: "belonging, warmth, harmony", summary: "Your dominant motive is Affiliation — close, warm relationships and a sense of belonging matter most to you. You're energized by connection and harmony." },
    POW: { name: "Power", title: "The Influencer", desc: "impact, influence, leading", summary: "Your dominant motive is Power — you're energized by influence and impact. Channeled toward others (socialized power), it makes for strong, empowering leadership." },
  },
  labels: { dominant: "Dominant motive", secondary: "Secondary motive", range: "Motive profile", profile: "Balance" },
  lead: "one motive clearly leads", blend: "two motives run close", profileDetail: "how dominant your top motive is",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = mcclellandTypeStrings(locale) ?? MCCLELLAND_TYPE_EN;
  const arr = Object.keys(CODE_EN).map((id) => ({ id, mean: s[id].mean }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const sep = top.mean - sorted[1].mean;
  const meta = T.meta[top.id];
  const sName = T.meta[sorted[1].id].name;
  return {
    code: CODE_EN[top.id],
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.dominant, value: meta.name, detail: meta.desc },
      { label: T.labels.secondary, value: sName, detail: T.meta[sorted[1].id].desc },
      { label: T.labels.range, value: sorted.map((x) => T.meta[x.id].name).join(" › ") },
      { label: T.labels.profile, value: sep >= 0.5 ? T.lead : T.blend, detail: T.profileDetail },
    ],
    confidence: Math.max(0.2, Math.min(0.95, 0.5 + sep)),
    secondary: sName,
  };
}

export const mcclelland: Instrument = {
  id: "mcclelland-needs",
  name: "McClelland's Needs",
  shortName: "Needs",
  kind: "typological",
  category: "strengths",
  tagline: "Achievement, Affiliation, or Power — what really drives you.",
  description:
    "David McClelland argued that three learned motives shape much of our behavior at work and in life: the need for " +
    "Achievement (to excel), Affiliation (to belong), and Power (to influence). Most people have one dominant driver. " +
    "Knowing yours clarifies which roles, goals, and environments will genuinely energize you.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in McClelland's theory of acquired needs.",
  scales: [
    { id: "ACH", name: "Need for Achievement", description: "Drive to set and meet challenging goals.", highDescriptor: "goal-driven and excellence-seeking", lowDescriptor: "less driven by personal accomplishment", poles: { low: "Less central", high: "Central" }, normMean: 3.6, normSd: 0.7 },
    { id: "AFF", name: "Need for Affiliation", description: "Drive for warm relationships and belonging.", highDescriptor: "connection- and harmony-seeking", lowDescriptor: "less driven by belonging", poles: { low: "Less central", high: "Central" }, normMean: 3.5, normSd: 0.72 },
    { id: "POW", name: "Need for Power", description: "Drive to influence, lead, and make an impact.", highDescriptor: "influence- and impact-seeking", lowDescriptor: "less driven by influence", poles: { low: "Less central", high: "Central" }, normMean: 3.2, normSd: 0.76 },
  ],
  items,
  resolveType,
  caveats: [
    "These are 'acquired' motives — learned and changeable — not fixed traits you're stuck with.",
    "Power has two faces: 'personalized' power seeks dominance for oneself, while 'socialized' power uses influence for the group's good. The motive itself is neutral.",
    "Most people are a blend; read your top two together.",
  ],
  citations: [
    { ref: "McClelland, D. C. (1961). The Achieving Society. Van Nostrand." },
    { ref: "McClelland, D. C. (1985). Human Motivation. Scott, Foresman." },
  ],
};

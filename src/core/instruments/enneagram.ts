import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { enneaTypeStrings, type EnneaTypeBundle } from "./i18n";

/**
 * Enneagram of Personality — nine interconnected types.
 *
 * Grounded in the contemporary Enneagram synthesis (Naranjo; Riso & Hudson;
 * Palmer). Items are ORIGINAL to this platform, written to capture each type's
 * core motivation (basic desire / basic fear) rather than surface behavior, which
 * is how the system is intended to be used. Resolution reports the dominant type,
 * its wing, its center of intelligence, and a confidence based on type separation.
 */

const L = {
  min: 1,
  max: 5,
  labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"],
};

const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Type 1 — Reformer
  it("T1a", "I have a strong inner sense of how things should be, and I notice when they fall short.", "T1"),
  it("T1b", "I hold myself to high standards and feel guilty when I don't meet them.", "T1"),
  it("T1c", "I feel compelled to correct errors and improve whatever isn't right.", "T1"),
  it("T1d", "Being good, fair, and beyond reproach matters deeply to me.", "T1"),
  // Type 2 — Helper
  it("T2a", "I can sense what others need and I instinctively move to help them.", "T2"),
  it("T2b", "I feel most valued when people rely on me and appreciate my care.", "T2"),
  it("T2c", "I put others' needs ahead of my own, sometimes more than is good for me.", "T2"),
  it("T2d", "It's hard for me when someone I care about is upset with me.", "T2"),
  // Type 3 — Achiever
  it("T3a", "I'm strongly driven to succeed and to be seen as successful.", "T3"),
  it("T3b", "I adapt how I present myself to win admiration and get results.", "T3"),
  it("T3c", "I measure my worth largely by my achievements and goals reached.", "T3"),
  it("T3d", "I stay busy and efficient, and I hate anything that makes me look like a failure.", "T3"),
  // Type 4 — Individualist
  it("T4a", "I often feel different from others, set apart in some essential way.", "T4"),
  it("T4b", "My emotions run deep, and I'm drawn to what's authentic, beautiful, or bittersweet.", "T4"),
  it("T4c", "I long for something missing that others seem to have.", "T4"),
  it("T4d", "Expressing my individuality matters to me; I dislike being ordinary.", "T4"),
  // Type 5 — Investigator
  it("T5a", "I guard my time and energy, preferring to observe before I engage.", "T5"),
  it("T5b", "I feel most secure when I'm knowledgeable and self-sufficient.", "T5"),
  it("T5c", "I withdraw to think things through privately rather than act on the spot.", "T5"),
  it("T5d", "I'd rather conserve my resources than depend on other people.", "T5"),
  // Type 6 — Loyalist
  it("T6a", "I scan for what could go wrong so that I'm prepared for it.", "T6"),
  it("T6b", "Loyalty and trust matter enormously to me, though trust is hard to earn.", "T6"),
  it("T6c", "I question reassurance and authority, then often seek it anyway.", "T6"),
  it("T6d", "I feel uneasy about security and look for guarantees that I'll be safe.", "T6"),
  // Type 7 — Enthusiast
  it("T7a", "I keep my options open and chase new, exciting experiences.", "T7"),
  it("T7b", "When things turn painful or dull, I quickly look for something more stimulating.", "T7"),
  it("T7c", "I'm optimistic and full of plans — often more than I can finish.", "T7"),
  it("T7d", "I really dislike feeling trapped, limited, or deprived.", "T7"),
  // Type 8 — Challenger
  it("T8a", "I instinctively take charge and protect the people I care about.", "T8"),
  it("T8b", "I'm direct and forceful, and I don't shy away from confrontation.", "T8"),
  it("T8c", "I resist being controlled and assert my will when I'm challenged.", "T8"),
  it("T8d", "Showing weakness feels risky, so I stay strong and in control.", "T8"),
  // Type 9 — Peacemaker
  it("T9a", "I go along with others to keep the peace and avoid conflict.", "T9"),
  it("T9b", "I can see every side, which sometimes makes it hard to know what I want.", "T9"),
  it("T9c", "I tend to merge with others' agendas and lose track of my own priorities.", "T9"),
  it("T9d", "I prefer comfort and calm, and I tune out when things get tense.", "T9"),
];

/** Center of intelligence per type — locale-invariant (drives logic + indexes the string bundle). */
const CENTER_OF: Record<number, "Body" | "Heart" | "Head"> = {
  1: "Body", 2: "Heart", 3: "Heart", 4: "Heart", 5: "Head", 6: "Head", 7: "Head", 8: "Body", 9: "Body",
};

/** English default; es/fr live in core/instruments/i18n.ts (enneaTypeStrings). */
const ENNEA_TYPE_EN: EnneaTypeBundle = {
  typeWord: "Type",
  meta: {
    1: { name: "The Reformer", short: "Reformer", title: "Principled, Purposeful, Self-Controlled", desire: "to be good, right, and balanced", fear: "of being corrupt, defective, or wrong", passion: "anger (held as resentment)", virtue: "serenity", summary: "A conscientious idealist driven to improve themselves and the world." },
    2: { name: "The Helper", short: "Helper", title: "Caring, Generous, People-Pleasing", desire: "to feel loved and needed", fear: "of being unwanted or unworthy of love", passion: "pride", virtue: "humility", summary: "A warm, giving presence attuned to the needs of others." },
    3: { name: "The Achiever", short: "Achiever", title: "Adaptable, Driven, Image-Conscious", desire: "to feel valuable and worthwhile", fear: "of being worthless or a failure", passion: "deceit (self-image)", virtue: "authenticity", summary: "An ambitious, efficient performer focused on success and recognition." },
    4: { name: "The Individualist", short: "Individualist", title: "Sensitive, Expressive, Introspective", desire: "to be uniquely themselves and find their identity", fear: "of having no significance or identity", passion: "envy", virtue: "equanimity", summary: "An emotionally honest seeker of depth, meaning, and authenticity." },
    5: { name: "The Investigator", short: "Investigator", title: "Perceptive, Cerebral, Self-Contained", desire: "to be capable and competent", fear: "of being useless, incapable, or overwhelmed", passion: "avarice (of energy)", virtue: "non-attachment", summary: "A private, insightful thinker who masters knowledge to feel secure." },
    6: { name: "The Loyalist", short: "Loyalist", title: "Committed, Vigilant, Security-Seeking", desire: "to have security and support", fear: "of being without guidance or support", passion: "fear (anxiety)", virtue: "courage", summary: "A dependable, alert ally who prepares for what could go wrong." },
    7: { name: "The Enthusiast", short: "Enthusiast", title: "Spontaneous, Versatile, Optimistic", desire: "to be satisfied and content", fear: "of being deprived, trapped, or in pain", passion: "gluttony (for experience)", virtue: "sobriety", summary: "A quick, upbeat adventurer chasing possibility and stimulation." },
    8: { name: "The Challenger", short: "Challenger", title: "Decisive, Powerful, Protective", desire: "to protect themselves and stay in control of their life", fear: "of being harmed, controlled, or violated", passion: "lust (intensity)", virtue: "innocence", summary: "A strong, assertive protector who confronts life head-on." },
    9: { name: "The Peacemaker", short: "Peacemaker", title: "Receptive, Reassuring, Easygoing", desire: "to have inner and outer peace", fear: "of loss, separation, and conflict", passion: "sloth (self-forgetting)", virtue: "right action", summary: "An accepting, steady presence who brings calm and seeks harmony." },
  },
  center: { Body: "Body", Heart: "Heart", Head: "Head" },
  centerDetail: { Body: "the gut/instinctive center (anger)", Heart: "the heart/feeling center (shame)", Head: "the head/thinking center (fear)" },
  labels: { core: "Core type", wing: "Wing", center: "Center of intelligence", desire: "Basic desire", fear: "Basic fear", passionVirtue: "Passion → Virtue", resonances: "Top resonances" },
  flavored: "flavored by Type {w} ({name})",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = enneaTypeStrings(locale) ?? ENNEA_TYPE_EN;
  const scores = Array.from({ length: 9 }, (_, i) => ({ type: i + 1, mean: s[`T${i + 1}`].mean }));
  const sorted = [...scores].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const runner = sorted[1];

  // Wing: the higher-scoring of the two adjacent types (1 and 9 are adjacent).
  const left = top.type === 1 ? 9 : top.type - 1;
  const right = top.type === 9 ? 1 : top.type + 1;
  const wing = scores[left - 1].mean >= scores[right - 1].mean ? left : right;

  const meta = T.meta[top.type];
  const centerKey = CENTER_OF[top.type];
  const sep = top.mean - runner.mean;
  const confidence = Math.max(0.2, Math.min(0.98, 0.5 + sep));

  const top3 = sorted.slice(0, 3).map((x) => `${T.typeWord} ${x.type} (${T.meta[x.type].short})`).join(" · ");

  return {
    code: `${top.type}w${wing}`,
    title: `${T.typeWord} ${top.type} — ${meta.name}`,
    summary: meta.summary,
    components: [
      { label: T.labels.core, value: `${T.typeWord} ${top.type}: ${meta.name}`, detail: meta.title },
      { label: T.labels.wing, value: `${top.type}w${wing}`, detail: T.flavored.replace("{w}", String(wing)).replace("{name}", T.meta[wing].short) },
      { label: T.labels.center, value: T.center[centerKey], detail: T.centerDetail[centerKey] },
      { label: T.labels.desire, value: meta.desire },
      { label: T.labels.fear, value: meta.fear },
      { label: T.labels.passionVirtue, value: `${meta.passion} → ${meta.virtue}` },
      { label: T.labels.resonances, value: top3 },
    ],
    confidence,
    secondary: `${runner.type}w${runner.type === 1 ? (s["T9"].mean >= s["T2"].mean ? 9 : 2) : runner.type === 9 ? (s["T8"].mean >= s["T1"].mean ? 8 : 1) : (s[`T${runner.type - 1}`].mean >= s[`T${runner.type + 1}`].mean ? runner.type - 1 : runner.type + 1)}`,
  };
}

export const enneagram: Instrument = {
  id: "enneagram-9",
  name: "Enneagram of Personality",
  shortName: "Enneagram",
  kind: "typological",
  category: "types",
  tagline: "Nine types, three centers — a map of core motivation.",
  description:
    "The Enneagram describes nine personality types organized around core motivations — each type's basic " +
    "desire and basic fear — rather than surface traits. This profiler estimates your resonance with all nine " +
    "types and resolves your dominant type, wing, and center of intelligence, framing growth as the movement " +
    "from each type's characteristic passion toward its virtue.",
  estMinutes: 7,
  responseFormat: L,
  itemProvenance:
    "Original motivation-based items written for this platform, informed by the contemporary Enneagram literature (Naranjo; Riso & Hudson; Palmer).",
  scales: [
    { id: "T1", name: "Type 1 · Reformer", description: "Principled, self-disciplined, improvement-driven.", highDescriptor: "high resonance with the Reformer's pursuit of integrity and correctness", lowDescriptor: "low resonance with Type 1 motivations", normMean: 3.0, normSd: 0.9 },
    { id: "T2", name: "Type 2 · Helper", description: "Caring, giving, relationship-focused.", highDescriptor: "high resonance with the Helper's drive to be needed and loved", lowDescriptor: "low resonance with Type 2 motivations", normMean: 3.0, normSd: 0.9 },
    { id: "T3", name: "Type 3 · Achiever", description: "Driven, adaptive, success-oriented.", highDescriptor: "high resonance with the Achiever's pursuit of value through accomplishment", lowDescriptor: "low resonance with Type 3 motivations", normMean: 3.0, normSd: 0.9 },
    { id: "T4", name: "Type 4 · Individualist", description: "Sensitive, expressive, identity-seeking.", highDescriptor: "high resonance with the Individualist's search for authentic identity", lowDescriptor: "low resonance with Type 4 motivations", normMean: 3.0, normSd: 0.9 },
    { id: "T5", name: "Type 5 · Investigator", description: "Cerebral, private, competence-seeking.", highDescriptor: "high resonance with the Investigator's drive for understanding and self-sufficiency", lowDescriptor: "low resonance with Type 5 motivations", normMean: 3.0, normSd: 0.9 },
    { id: "T6", name: "Type 6 · Loyalist", description: "Vigilant, committed, security-seeking.", highDescriptor: "high resonance with the Loyalist's search for security and support", lowDescriptor: "low resonance with Type 6 motivations", normMean: 3.0, normSd: 0.9 },
    { id: "T7", name: "Type 7 · Enthusiast", description: "Optimistic, spontaneous, possibility-seeking.", highDescriptor: "high resonance with the Enthusiast's pursuit of satisfaction and freedom", lowDescriptor: "low resonance with Type 7 motivations", normMean: 3.0, normSd: 0.9 },
    { id: "T8", name: "Type 8 · Challenger", description: "Assertive, protective, control-seeking.", highDescriptor: "high resonance with the Challenger's drive for strength and autonomy", lowDescriptor: "low resonance with Type 8 motivations", normMean: 3.0, normSd: 0.9 },
    { id: "T9", name: "Type 9 · Peacemaker", description: "Accommodating, steady, harmony-seeking.", highDescriptor: "high resonance with the Peacemaker's pursuit of peace and union", lowDescriptor: "low resonance with Type 9 motivations", normMean: 3.0, normSd: 0.9 },
  ],
  items,
  resolveType,
  caveats: [
    "The Enneagram is a framework for self-understanding and growth, not a validated diagnostic test.",
    "This framework focuses on motivations as well as behavior. Read the top two or three patterns and notice what feels useful, without treating a label as fixed.",
    "It is common to relate to several types; the wing and nearby types color the core type rather than contradict it.",
  ],
  citations: [
    { ref: "Riso, D. R., & Hudson, R. (1999). The Wisdom of the Enneagram. Bantam.", note: "Type structure, basic desires/fears, levels of development." },
    { ref: "Naranjo, C. (1990/1994). Character and Neurosis: An Integrative View. Gateways.", note: "Psychological grounding of the nine character types." },
    { ref: "Palmer, H. (1988). The Enneagram: Understanding Yourself and the Others in Your Life. HarperOne.", note: "Narrative tradition of the nine types." },
  ],
};

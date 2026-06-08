import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Keirsey Temperaments (Guardian · Artisan · Idealist · Rational).
 *
 * David Keirsey grouped the sixteen Jungian types into four temperaments along two
 * dimensions — how you communicate (concrete vs. abstract) and how you act
 * (cooperative vs. utilitarian). Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Communication: high = Abstract / introspective, low = Concrete / observant
  it("C1", "I'm drawn to theories, patterns, and what things could mean.", "COMM"),
  it("C2", "I often think about the future and abstract possibilities.", "COMM"),
  it("C3", "I enjoy symbolic, imaginative, or philosophical conversation.", "COMM"),
  it("C4", "I focus on concrete facts and what's actually in front of me.", "COMM", -1),
  it("C5", "I trust hands-on experience over theory.", "COMM", -1),
  it("C6", "I prefer practical, literal, down-to-earth talk.", "COMM", -1),
  // Action: high = Utilitarian / effective, low = Cooperative / proper
  it("A1", "I do whatever works to get the result, even if it breaks convention.", "ACT"),
  it("A2", "Effectiveness matters to me more than following the rules.", "ACT"),
  it("A3", "I'll improvise my own method if the official one is inefficient.", "ACT"),
  it("A4", "I think it matters to do things the right and proper way.", "ACT", -1),
  it("A5", "I prefer to cooperate and honor accepted procedures.", "ACT", -1),
  it("A6", "I feel better when I act in socially approved ways.", "ACT", -1),
];

type Key = "Guardian" | "Artisan" | "Idealist" | "Rational";
const META: Record<Key, { code: string; title: string; family: string; summary: string }> = {
  Guardian: { code: "SJ", title: "The Guardian", family: "Sensing–Judging (SJ)", summary: "Dependable, dutiful, and grounded — you keep people, plans, and institutions steady and looked-after." },
  Artisan: { code: "SP", title: "The Artisan", family: "Sensing–Perceiving (SP)", summary: "Adaptable, hands-on, and bold — you read the moment and make things work, often with style and flair." },
  Idealist: { code: "NF", title: "The Idealist", family: "Intuitive–Feeling (NF)", summary: "Empathic, meaning-seeking, and authentic — you nurture growth, harmony, and people's potential." },
  Rational: { code: "NT", title: "The Rational", family: "Intuitive–Thinking (NT)", summary: "Strategic, inventive, and competence-driven — you master systems, ideas, and long-range problems." },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const abstract = s.COMM.normalized >= 50;
  const utilitarian = s.ACT.normalized >= 50;
  const key: Key = abstract
    ? utilitarian ? "Rational" : "Idealist"
    : utilitarian ? "Artisan" : "Guardian";
  const meta = META[key];
  const commGap = Math.abs(s.COMM.normalized - 50) / 50;
  const actGap = Math.abs(s.ACT.normalized - 50) / 50;
  const confidence = Math.max(0.2, Math.min(0.98, 0.45 + (commGap + actGap) / 2));
  return {
    code: meta.code,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: "Temperament", value: `${key} · ${meta.code}`, detail: meta.family },
      { label: "Communication", value: abstract ? "Abstract" : "Concrete", detail: abstract ? "ideas, patterns, possibilities" : "facts, the tangible here-and-now" },
      { label: "Action", value: utilitarian ? "Utilitarian" : "Cooperative", detail: utilitarian ? "do what works" : "do what's proper" },
      { label: "Clarity", value: `${Math.round((commGap + actGap) * 50)}/100`, detail: "how decisively both axes leaned" },
    ],
    confidence,
  };
}

export const keirsey: Instrument = {
  id: "keirsey-temperaments",
  name: "Keirsey Temperaments",
  shortName: "Keirsey",
  kind: "typological",
  category: "types",
  tagline: "Four temperaments — Guardian, Artisan, Idealist, Rational.",
  description:
    "David Keirsey reorganized the sixteen Jungian types into four temperaments built on two questions: do you " +
    "communicate in concrete or abstract terms, and do you act cooperatively or do whatever's effective? The crossing " +
    "of those two axes yields the Guardian, Artisan, Idealist, and Rational — a memorable, behavior-focused lens on type.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Keirsey's temperament theory.",
  scales: [
    { id: "COMM", name: "Communication", description: "Concrete/observant vs. abstract/introspective focus.", highDescriptor: "abstract, future- and possibility-oriented", lowDescriptor: "concrete, factual, and present-focused", poles: { low: "Concrete", high: "Abstract" }, normMean: 3.0, normSd: 0.75 },
    { id: "ACT", name: "Action", description: "Cooperative (proper) vs. utilitarian (effective) approach.", highDescriptor: "utilitarian — does what works", lowDescriptor: "cooperative — does what's proper", poles: { low: "Cooperative", high: "Utilitarian" }, normMean: 3.0, normSd: 0.72 },
  ],
  items,
  resolveType,
  caveats: [
    "Temperament is a broad sketch, not a box — most people show a clear lead but draw on all four at times.",
    "Keirsey's system overlaps the MBTI/Jungian tradition, which has limited empirical support; treat it as a reflective lens.",
    "There is no better or worse temperament — each has its own gifts and blind spots.",
  ],
  citations: [
    { ref: "Keirsey, D. (1998). Please Understand Me II: Temperament, Character, Intelligence. Prometheus Nemesis." },
    { ref: "Keirsey, D., & Bates, M. (1984). Please Understand Me: Character and Temperament Types. Prometheus Nemesis." },
  ],
};

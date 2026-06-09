import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Keirsey Temperaments (Guardian · Artisan · Idealist · Rational).
 *
 * David Keirsey grouped the sixteen Jungian types into four temperaments along two
 * dimensions — how you communicate (concrete vs. abstract) and how you act
 * (cooperative vs. utilitarian). Items are ORIGINAL to this platform.
 */

// Keirsey's two axes are natural forced choices: in any moment you lean one way or the
// other, and the pick pins your temperament far more cleanly than rating six statements.
const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
/** Forced-choice pair on one bipolar axis: option 0 = high pole (+1), option 1 = low pole (−1). */
const fc = (id: string, scale: string, text: string, hi: string, lo: string): Item => ({
  id,
  text,
  scale,
  keyed: 1,
  options: [{ text: hi, scale, keyed: 1 }, { text: lo, scale, keyed: -1 }],
});

const items: Item[] = [
  // Communication: high = Abstract / introspective, low = Concrete / observant
  fc("KC1", "COMM", "When you talk and think, you're more drawn to…", "theories, patterns, and what things could mean", "concrete facts and what's right in front of you"),
  fc("KC2", "COMM", "You'd rather a good conversation be…", "imaginative, symbolic, or philosophical", "practical, literal, and down-to-earth"),
  fc("KC3", "COMM", "Your attention naturally goes to…", "future possibilities and what could be", "present realities and what actually is"),
  fc("KC4", "COMM", "You trust more…", "theory and the patterns you infer", "hands-on experience and the tangible"),
  fc("KC5", "COMM", "Your mind tends to drift toward…", "abstractions and big-picture meaning", "specifics, details, and the concrete"),
  // Action: high = Utilitarian / effective, low = Cooperative / proper
  fc("KA1", "ACT", "To reach a goal, you'd rather…", "do whatever works, even if unconventional", "do it the right and proper way"),
  fc("KA2", "ACT", "What guides you more?", "effectiveness and results", "rules and accepted procedure"),
  fc("KA3", "ACT", "When the official method is inefficient, you…", "improvise your own that works", "follow it anyway, out of propriety"),
  fc("KA4", "ACT", "You feel better when you…", "get the outcome by any sensible means", "act in socially approved ways"),
  fc("KA5", "ACT", "You'd describe yourself as more…", "pragmatic and utilitarian", "cooperative and proper"),
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
  format: "choice",
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

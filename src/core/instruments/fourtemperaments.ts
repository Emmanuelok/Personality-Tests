import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { fourTempTypeStrings, type FourTempTypeBundle } from "./i18n";

/**
 * The Four Temperaments — the classical model (Hippocrates / Galen) of Sanguine,
 * Choleric, Melancholic, and Phlegmatic, still widely used as an intuitive map of
 * temperament. Items are ORIGINAL to this platform. Most people are a blend led by
 * a primary and secondary temperament.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "A little", "Somewhat", "Mostly like me", "Very much like me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Sanguine
  it("SA1", "I'm outgoing, talkative, and love being around people.", "SANG"),
  it("SA2", "I'm enthusiastic and bring energy and fun wherever I go.", "SANG"),
  it("SA3", "I act on impulse and chase whatever excites me in the moment.", "SANG"),
  it("SA4", "I make friends easily and rarely meet a stranger.", "SANG"),
  // Choleric
  it("CH1", "I'm driven, decisive, and like to be in charge.", "CHOL"),
  it("CH2", "I set big goals and push hard to achieve them.", "CHOL"),
  it("CH3", "I'm direct and not afraid of confrontation.", "CHOL"),
  it("CH4", "I get impatient when things or people move too slowly.", "CHOL"),
  // Melancholic
  it("ME1", "I'm analytical and think deeply before I act.", "MEL"),
  it("ME2", "I hold high standards and notice every flaw and detail.", "MEL"),
  it("ME3", "I feel things deeply and can be moved to strong emotion.", "MEL"),
  it("ME4", "I prefer careful planning and order to spontaneity.", "MEL"),
  // Phlegmatic
  it("PH1", "I'm calm, steady, and hard to ruffle.", "PHLEG"),
  it("PH2", "I'm easygoing and go along with things to keep the peace.", "PHLEG"),
  it("PH3", "I'm patient, loyal, and dependable.", "PHLEG"),
  it("PH4", "I prefer a quiet, predictable life to drama and change.", "PHLEG"),
];

/** Canonical, language-agnostic temperament codes (the English names). */
const CODE_EN: Record<string, string> = { SANG: "Sanguine", CHOL: "Choleric", MEL: "Melancholic", PHLEG: "Phlegmatic" };

/** English default; es/fr live in core/instruments/i18n.ts (fourTempTypeStrings). */
const FOURTEMP_TYPE_EN: FourTempTypeBundle = {
  meta: {
    SANG: { name: "Sanguine", title: "The Spark", desc: "sociable, lively, optimistic", summary: "Warm, enthusiastic, and people-loving — you bring energy and fun, and live in the moment." },
    CHOL: { name: "Choleric", title: "The Driver", desc: "ambitious, decisive, bold", summary: "Driven, decisive, and natural at leading — you set big goals and charge after them." },
    MEL: { name: "Melancholic", title: "The Deep Thinker", desc: "analytical, sensitive, precise", summary: "Thoughtful, deep, and detail-oriented — you feel intensely and hold high standards." },
    PHLEG: { name: "Phlegmatic", title: "The Steady", desc: "calm, loyal, peaceful", summary: "Calm, patient, and dependable — you keep the peace and provide quiet stability." },
  },
  labels: { primary: "Primary temperament", secondary: "Secondary temperament", blend: "Blend", order: "Full order" },
  strong: (name) => `Strong ${name}`,
  blendSummary: (summary, a, b) => `${summary} You're a clear ${a}–${b} blend.`,
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = fourTempTypeStrings(locale) ?? FOURTEMP_TYPE_EN;
  const ids = ["SANG", "CHOL", "MEL", "PHLEG"];
  const sorted = ids.map((id) => ({ id, mean: s[id].mean })).sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const second = sorted[1];
  const sep = top.mean - second.mean;
  const blended = sep < 0.4;
  const meta = T.meta[top.id];
  const sName = T.meta[second.id].name;
  return {
    code: blended ? `${CODE_EN[top.id]}-${CODE_EN[second.id]}` : CODE_EN[top.id],
    title: meta.title,
    summary: blended ? T.blendSummary(meta.summary, meta.name, sName) : meta.summary,
    components: [
      { label: T.labels.primary, value: meta.name, detail: meta.desc },
      { label: T.labels.secondary, value: sName, detail: T.meta[second.id].desc },
      { label: T.labels.blend, value: blended ? `${meta.name}-${sName}` : T.strong(meta.name) },
      { label: T.labels.order, value: sorted.map((x) => T.meta[x.id].name).join(" › ") },
    ],
    confidence: Math.max(0.2, Math.min(0.98, 0.5 + sep)),
    secondary: sName,
  };
}

export const temperaments: Instrument = {
  id: "four-temperaments",
  name: "The Four Temperaments",
  shortName: "Temperaments",
  kind: "typological",
  category: "types",
  tagline: "The classic map: Sanguine, Choleric, Melancholic, Phlegmatic.",
  description:
    "One of the oldest models of personality, the four temperaments — Sanguine (lively), Choleric (driven), " +
    "Melancholic (deep), and Phlegmatic (calm) — remain a vivid, intuitive way to understand yourself. This " +
    "profiler finds your leading temperament and the secondary that colors it.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, based on the classical four-temperaments model (Hippocrates / Galen).",
  scales: [
    { id: "SANG", name: "Sanguine", description: "Sociable, enthusiastic, lively, spontaneous.", highDescriptor: "outgoing, enthusiastic, and fun-loving", lowDescriptor: "more reserved than sociable", poles: { low: "Reserved", high: "Lively" }, normMean: 3.2, normSd: 0.75 },
    { id: "CHOL", name: "Choleric", description: "Driven, decisive, ambitious, fiery.", highDescriptor: "ambitious, decisive, and bold", lowDescriptor: "less driven toward leading and pushing", poles: { low: "Easygoing", high: "Driven" }, normMean: 3.1, normSd: 0.75 },
    { id: "MEL", name: "Melancholic", description: "Analytical, deep, sensitive, perfectionistic.", highDescriptor: "thoughtful, deep-feeling, and precise", lowDescriptor: "less inclined to deep analysis and intensity", poles: { low: "Light", high: "Deep" }, normMean: 3.2, normSd: 0.72 },
    { id: "PHLEG", name: "Phlegmatic", description: "Calm, easygoing, loyal, peaceful.", highDescriptor: "calm, patient, and steady", lowDescriptor: "less placid, more restless", poles: { low: "Restless", high: "Calm" }, normMean: 3.3, normSd: 0.72 },
  ],
  items,
  resolveType,
  caveats: [
    "An intuitive historical model, not a modern validated instrument — useful as a vivid lens, not a verdict.",
    "Nearly everyone is a blend; your top two together tell the fuller story.",
  ],
  citations: [
    { ref: "Galen (2nd c. CE). On the Temperaments. (Building on Hippocratic humoral theory.)" },
    { ref: "Kant, I. (1798). Anthropology from a Pragmatic Point of View. (Classic treatment of the four temperaments.)" },
    { ref: "Keirsey, D. (1998). Please Understand Me II. Prometheus Nemesis. (Modern temperament framework.)" },
  ],
};

import type { Instrument, Item } from "../types";

/**
 * Eysenck PEN model (Psychoticism · Extraversion · Neuroticism).
 *
 * Hans Eysenck's biologically-rooted model reduces personality to three broad
 * dimensions. "Psychoticism" is a historical label for tough-minded, nonconforming,
 * impulsive tendencies — it does NOT mean psychosis. Items are ORIGINAL to this
 * platform, grounded in the EPQ tradition.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Extraversion
  it("E1", "I make friends easily and enjoy lively social gatherings.", "EXT"),
  it("E2", "I'd call myself the life of the party more than a wallflower.", "EXT"),
  it("E3", "I like plenty of excitement and activity around me.", "EXT"),
  it("E4", "I often act on the spur of the moment.", "EXT"),
  it("E5", "I prefer a quiet evening alone to a big social event.", "EXT", -1),
  it("E6", "I tend to keep in the background at social events.", "EXT", -1),
  // Neuroticism
  it("N1", "My mood can swing quickly for little reason.", "NEU"),
  it("N2", "I worry about things long after they're over.", "NEU"),
  it("N3", "I often feel tense or on edge.", "NEU"),
  it("N4", "I frequently feel anxious without quite knowing why.", "NEU"),
  it("N5", "I stay calm and steady under pressure.", "NEU", -1),
  it("N6", "Small setbacks rarely shake my composure.", "NEU", -1),
  // Psychoticism (tough-mindedness / nonconformity)
  it("P1", "I question rules and conventions rather than simply following them.", "PSY"),
  it("P2", "I'm fairly unsentimental and matter-of-fact about most things.", "PSY"),
  it("P3", "I prefer to go my own way, even if others disapprove.", "PSY"),
  it("P4", "I can be blunt and tough-minded when a situation calls for it.", "PSY"),
  it("P5", "I'm very considerate of other people's feelings.", "PSY", -1),
  it("P6", "I like to fit in and follow accepted social norms.", "PSY", -1),
];

export const eysenck: Instrument = {
  id: "eysenck-pen",
  name: "Eysenck PEN Profile",
  shortName: "PEN",
  kind: "dimensional",
  category: "core",
  tagline: "Three broad dimensions — Extraversion, Neuroticism, and tough-mindedness.",
  description:
    "Hans Eysenck argued that personality boils down to a few broad, biologically-based dimensions. This profiler " +
    "maps the classic three — Extraversion, Neuroticism (emotional reactivity), and Psychoticism (a historical label " +
    "for tough-minded, nonconforming, impulsive tendencies — not psychosis). It's a useful complement to the Big Five, " +
    "tracing the same terrain from Eysenck's influential lens.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Eysenck's PEN model and the EPQ tradition.",
  scales: [
    { id: "EXT", name: "Extraversion", description: "Sociability, activity, and stimulation-seeking.", highDescriptor: "outgoing, energetic, and drawn to excitement", lowDescriptor: "reserved, quiet, and content with calm", poles: { low: "Introverted", high: "Extraverted" }, normMean: 3.2, normSd: 0.8 },
    { id: "NEU", name: "Neuroticism", description: "Emotional reactivity and proneness to stress.", highDescriptor: "emotionally reactive, sensitive to stress, and easily worried", lowDescriptor: "calm, even-keeled, and hard to rattle", poles: { low: "Stable", high: "Reactive" }, normMean: 3.0, normSd: 0.82 },
    { id: "PSY", name: "Tough-Mindedness", description: "Nonconformity, unsentimentality, and bluntness (Eysenck's 'Psychoticism').", highDescriptor: "independent, tough-minded, and unconventional", lowDescriptor: "warm, agreeable, and conventional", poles: { low: "Tender / conforming", high: "Tough / nonconforming" }, normMean: 2.7, normSd: 0.72 },
  ],
  items,
  caveats: [
    "Eysenck's 'Psychoticism' is a historical name for tough-minded, nonconforming, impulsive tendencies — it does NOT indicate psychosis or any disorder.",
    "The PEN model is broad by design; the Big Five or HEXACO give a more fine-grained picture.",
    "This is an educational self-reflection tool, not a clinical or diagnostic instrument.",
  ],
  citations: [
    { ref: "Eysenck, H. J., & Eysenck, S. B. G. (1975). Manual of the Eysenck Personality Questionnaire. Hodder & Stoughton." },
    { ref: "Eysenck, H. J. (1967). The Biological Basis of Personality. Charles C. Thomas." },
  ],
};

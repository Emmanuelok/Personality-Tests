import type { Instrument, Item } from "../types";

/**
 * PANAS — Positive and Negative Affect Schedule (Watson, Clark & Tellegen). Two
 * largely independent dimensions of mood. A research workhorse. Original adjective
 * set in the PANAS tradition.
 */

const L = { min: 1, max: 5, labels: ["Very slightly", "A little", "Moderately", "Quite a bit", "Extremely"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("P1", "Interested", "PA"),
  it("P2", "Enthusiastic", "PA"),
  it("P3", "Proud", "PA"),
  it("P4", "Alert", "PA"),
  it("P5", "Inspired", "PA"),
  it("P6", "Determined", "PA"),
  it("P7", "Attentive", "PA"),
  it("P8", "Active", "PA"),
  it("N1", "Distressed", "NA"),
  it("N2", "Upset", "NA"),
  it("N3", "Guilty", "NA"),
  it("N4", "Scared", "NA"),
  it("N5", "Hostile", "NA"),
  it("N6", "Irritable", "NA"),
  it("N7", "Nervous", "NA"),
  it("N8", "Afraid", "NA"),
];

export const panas: Instrument = {
  id: "panas-affect",
  name: "Positive & Negative Affect",
  shortName: "PANAS",
  kind: "dimensional",
  category: "wellbeing",
  tagline: "Two independent moods — how much positive and negative feeling you carry.",
  description:
    "Mood isn't a single dial from bad to good. The PANAS treats positive affect (enthusiasm, alertness, energy) and " +
    "negative affect (distress, irritability, fear) as two largely independent dimensions — you can be high or low on " +
    "each. Rate how much you've felt each way lately to see the balance you're carrying.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original adjective set written for this platform, grounded in Watson, Clark & Tellegen's PANAS.",
  scales: [
    { id: "PA", name: "Positive Affect", description: "Energy, enthusiasm, and engaged pleasant feeling.", highDescriptor: "energized, enthusiastic, and engaged", lowDescriptor: "flat, low-energy, and disengaged", poles: { low: "Low energy", high: "High energy" }, normMean: 3.3, normSd: 0.72 },
    { id: "NA", name: "Negative Affect", description: "Distress, irritability, and unpleasant arousal.", highDescriptor: "tense, distressed, and easily upset", lowDescriptor: "calm and largely free of distress", poles: { low: "Serene", high: "Distressed" }, normMean: 2.3, normSd: 0.78 },
  ],
  items,
  caveats: [
    "These two dimensions are largely independent — high positive affect doesn't guarantee low negative affect, and vice versa.",
    "Rate 'how you've felt lately'; affect shifts with circumstances, sleep, and time of day, so this is a snapshot.",
    "An educational self-reflection, not a clinical mood assessment.",
  ],
  citations: [
    { ref: "Watson, D., Clark, L. A., & Tellegen, A. (1988). Development and validation of brief measures of positive and negative affect: The PANAS scales. JPSP, 54(6), 1063–1070." },
  ],
};

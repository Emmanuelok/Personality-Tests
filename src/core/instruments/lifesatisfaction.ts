import type { Instrument, Item } from "../types";

/**
 * Satisfaction With Life Scale (Diener).
 *
 * The standard global measure of life satisfaction — your overall cognitive
 * judgment of how your life is going, against your own standards. Five items,
 * heavily validated. Wording follows the widely-reproduced SWLS.
 */

const L = { min: 1, max: 7, labels: ["Strongly disagree", "Disagree", "Slightly disagree", "Neutral", "Slightly agree", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("L1", "In most ways my life is close to my ideal.", "SWL"),
  it("L2", "The conditions of my life are excellent.", "SWL"),
  it("L3", "I am satisfied with my life.", "SWL"),
  it("L4", "So far I have gotten the important things I want in life.", "SWL"),
  it("L5", "If I could live my life over, I would change almost nothing.", "SWL"),
];

export const lifeSatisfaction: Instrument = {
  id: "life-satisfaction-swls",
  name: "Satisfaction With Life",
  shortName: "Life Satisfaction",
  kind: "dimensional",
  category: "focused",
  tagline: "Your overall verdict on how life is going, by your own standards.",
  description:
    "The Satisfaction With Life Scale is the most widely used measure of the reflective, judgmental side of wellbeing — " +
    "not how you feel moment to moment, but your considered verdict on life as a whole, against the standards you set " +
    "for yourself. Five short statements, decades of validation across the world.",
  estMinutes: 1,
  responseFormat: L,
  itemProvenance: "Items follow the widely-reproduced Satisfaction With Life Scale (Diener et al., 1985).",
  scales: [
    { id: "SWL", name: "Life Satisfaction", description: "Global cognitive judgment of satisfaction with your life.", highDescriptor: "broadly satisfied — life is close to your ideal", lowDescriptor: "dissatisfied — life falls short of what you want", poles: { low: "Dissatisfied", high: "Satisfied" }, normMean: 4.6, normSd: 1.3 },
  ],
  items,
  caveats: [
    "Life satisfaction naturally rises and falls with circumstances; this is a snapshot of a moment, not a fixed grade.",
    "It measures your considered judgment, which is distinct from day-to-day mood — you can feel cheerful yet judge life as off-track, or vice versa.",
    "If your satisfaction is persistently low and weighing on you, it can help to talk it through with someone you trust or a professional.",
  ],
  citations: [
    { ref: "Diener, E., Emmons, R. A., Larsen, R. J., & Griffin, S. (1985). The Satisfaction With Life Scale. Journal of Personality Assessment, 49(1), 71–75." },
    { ref: "Pavot, W., & Diener, E. (2008). The Satisfaction With Life Scale and the emerging construct of life satisfaction. Journal of Positive Psychology, 3(2), 137–152." },
  ],
};

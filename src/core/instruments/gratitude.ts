import type { Instrument, Item } from "../types";

/**
 * Gratitude — the disposition to notice and appreciate the good, and to feel
 * thankful. One of the best-evidenced predictors of wellbeing, and highly
 * trainable. Items are ORIGINAL to this platform, grounded in the Gratitude
 * Questionnaire (McCullough, Emmons & Tsang, 2002).
 */

const L = { min: 1, max: 7, labels: ["Strongly disagree", "Disagree", "Slightly disagree", "Neutral", "Slightly agree", "Agree", "Strongly agree"] };
const it = (id: string, text: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale: "GRAT", keyed });

const items: Item[] = [
  it("G1", "I have so much in life to be thankful for."),
  it("G2", "If I listed everything I felt grateful for, it would be a long list."),
  it("G3", "I'm grateful to a wide range of people."),
  it("G4", "As I get older, I appreciate more the people and things in my life."),
  it("G5", "I often notice and savor small good moments."),
  it("G6", "Long stretches go by before I feel grateful for anything.", -1),
  it("G7", "It's hard for me to feel thankful for what I have.", -1),
];

export const gratitude: Instrument = {
  id: "gratitude-gq6",
  name: "Gratitude",
  shortName: "Gratitude",
  kind: "dimensional",
  category: "emotional",
  tagline: "How readily you notice and feel thankful for the good.",
  description:
    "Gratitude is the habit of noticing what's good and feeling thankful for it — and it's one of the most reliable, " +
    "most trainable ingredients of a happy life. People higher in gratitude report more positive emotion, stronger " +
    "relationships, and greater resilience. This is a warm snapshot of your grateful disposition and a baseline you can grow.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Gratitude Questionnaire (McCullough, Emmons & Tsang, 2002).",
  scales: [
    {
      id: "GRAT",
      name: "Gratitude",
      description: "The disposition to notice, appreciate, and feel thankful for the good in life.",
      highDescriptor: "quick to notice the good and feel genuinely thankful",
      lowDescriptor: "less inclined to dwell on what you're thankful for",
      poles: { low: "Reserved", high: "Grateful" },
      normMean: 5.6,
      normSd: 1.1,
    },
  ],
  items,
  caveats: [
    "Gratitude is highly trainable — simple practices (a nightly 'three good things', a gratitude letter) move it reliably over weeks.",
    "Gratitude isn't toxic positivity: it doesn't require ignoring what's hard, only also noticing what's good.",
    "A momentary low can reflect a heavy season rather than your enduring disposition.",
    "This is a positive-psychology reflection tool, not a clinical measure.",
  ],
  citations: [
    { ref: "McCullough, M. E., Emmons, R. A., & Tsang, J. (2002). The grateful disposition. Journal of Personality and Social Psychology, 82(1), 112–127." },
    { ref: "Emmons, R. A., & McCullough, M. E. (2003). Counting blessings versus burdens. Journal of Personality and Social Psychology, 84(2), 377–389." },
  ],
};

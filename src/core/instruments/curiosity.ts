import type { Instrument, Item } from "../types";

/**
 * Curiosity (Curiosity and Exploration Inventory, CEI-II).
 *
 * Kashdan's model splits trait curiosity into STRETCHING (actively seeking out
 * new knowledge and experience) and EMBRACING (welcoming the novel, uncertain,
 * and unpredictable). Curiosity predicts learning, wellbeing, and meaning. Items
 * are ORIGINAL to this platform, grounded in Kashdan et al. (2009).
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("S1", "I actively seek out new experiences and information.", "STRETCH"),
  it("S2", "I love exploring topics I know little about.", "STRETCH"),
  it("S3", "I'm the kind of person who goes looking for novelty.", "STRETCH"),
  it("S4", "Wherever I go, I'm on the lookout for new things to learn.", "STRETCH"),
  it("S5", "Learning about unfamiliar subjects energizes me.", "STRETCH"),
  it("S6", "I deliberately seek out challenges that stretch me.", "STRETCH"),
  it("E1", "I enjoy uncertainty and the unpredictable.", "EMBRACE"),
  it("E2", "I'm comfortable not knowing how things will turn out.", "EMBRACE"),
  it("E3", "Unfamiliar situations excite me more than they unsettle me.", "EMBRACE"),
  it("E4", "I welcome surprises and ambiguity.", "EMBRACE"),
  it("E5", "I'd rather face something new than stick with the familiar.", "EMBRACE"),
  it("E6", "Unpredictable people and ideas intrigue me.", "EMBRACE"),
];

export const curiosity: Instrument = {
  id: "curiosity-cei",
  name: "Curiosity & Exploration",
  shortName: "Curiosity",
  kind: "dimensional",
  category: "focused",
  tagline: "How strongly you seek the new — and how easily you embrace the unknown.",
  description:
    "Trait curiosity has two sides: STRETCHING — the appetite for new knowledge, skills, and experience — and " +
    "EMBRACING — the willingness to lean into novelty, uncertainty, and the unpredictable. Together they fuel learning, " +
    "creativity, and a richer sense of meaning. This profiler shows how strongly each runs in you and where curiosity could grow.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Curiosity and Exploration Inventory–II (Kashdan et al., 2009).",
  scales: [
    { id: "STRETCH", name: "Stretching", description: "Actively seeking new knowledge and experience.", highDescriptor: "hungry for new knowledge, skills, and experiences", lowDescriptor: "content with the familiar and well-known", poles: { low: "Settled", high: "Seeking" }, normMean: 3.5, normSd: 0.74 },
    { id: "EMBRACE", name: "Embracing", description: "Welcoming novelty, ambiguity, and the unpredictable.", highDescriptor: "energized by uncertainty and the unfamiliar", lowDescriptor: "preferring predictability and certainty", poles: { low: "Prefers certainty", high: "Embraces novelty" }, normMean: 3.2, normSd: 0.78 },
  ],
  items,
  caveats: [
    "Both kinds of curiosity are buildable — small, deliberate doses of novelty widen the comfort zone over time.",
    "A lower Embracing score isn't a flaw; valuing certainty has real strengths, and curiosity can be channeled toward depth instead of breadth.",
    "An educational self-reflection tool, not a clinical or aptitude measure.",
  ],
  citations: [
    { ref: "Kashdan, T. B., et al. (2009). The Curiosity and Exploration Inventory–II: development, factor structure, and psychometrics. Journal of Research in Personality, 43(6), 987–998." },
    { ref: "Kashdan, T. B., & Silvia, P. J. (2009). Curiosity and interest: The benefits of thriving on novelty and challenge. Oxford Handbook of Positive Psychology." },
  ],
};

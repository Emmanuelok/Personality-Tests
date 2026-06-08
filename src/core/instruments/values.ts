import type { Instrument, Item } from "../types";

/**
 * Personal Values (Schwartz's Theory of Basic Human Values — 10 values).
 *
 * Schwartz (1992) identified ten broad values recognized across cultures, arranged
 * in a motivational circle. Knowing which values you rank highest clarifies why you
 * make the choices you do — and helps you build a life that fits them. Items are
 * ORIGINAL to this platform, in the spirit of the Portrait Values Questionnaire.
 */

const L = { min: 1, max: 5, labels: ["Not important to me", "Slightly", "Moderately", "Very important", "Of supreme importance"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("SD1", "Making my own choices and being free to direct my life.", "SD"),
  it("SD2", "Being creative and exploring my own ideas and curiosity.", "SD"),
  it("ST1", "Excitement, novelty, and adventure.", "ST"),
  it("ST2", "A varied, surprising life over a predictable one.", "ST"),
  it("HE1", "Enjoying life's pleasures and treating myself.", "HE"),
  it("HE2", "Seeking out fun and things that simply feel good.", "HE"),
  it("AC1", "Being successful and showing my competence.", "AC"),
  it("AC2", "Achieving a lot and being recognized for it.", "AC"),
  it("PO1", "Having influence, status, or control over resources.", "PO"),
  it("PO2", "Being in a position of authority and leadership.", "PO"),
  it("SE1", "Safety, stability, and order in my life and society.", "SE"),
  it("SE2", "A secure, predictable environment for me and my family.", "SE"),
  it("CO1", "Following the rules and not upsetting or offending others.", "CO"),
  it("CO2", "Being polite and doing what is expected of me.", "CO"),
  it("TR1", "Honoring tradition and the customs handed down to me.", "TR"),
  it("TR2", "Being humble and respecting long-held beliefs.", "TR"),
  it("BE1", "Caring for the wellbeing of the people close to me.", "BE"),
  it("BE2", "Being loyal, devoted, and helpful to friends and family.", "BE"),
  it("UN1", "Justice, equality, and the wellbeing of all people.", "UN"),
  it("UN2", "Protecting nature and the environment.", "UN"),
];

export const values: Instrument = {
  id: "schwartz-values",
  name: "Personal Values (Schwartz)",
  shortName: "Values",
  kind: "dimensional",
  category: "strengths",
  tagline: "What you truly care about — the compass behind your choices.",
  description:
    "Schwartz's theory maps ten basic human values that guide our decisions across cultures, from " +
    "Self-Direction and Achievement to Benevolence and Universalism. This profiler shows which values rank " +
    "highest for you, so you can align your time, work, and relationships with what actually matters to you.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Schwartz's value theory and the Portrait Values Questionnaire tradition.",
  scales: [
    { id: "SD", name: "Self-Direction", description: "Independence of thought and action; freedom and creativity.", highDescriptor: "valuing freedom, autonomy, and creative self-expression", lowDescriptor: "comfortable being guided rather than self-directing", normMean: 3.9, normSd: 0.65 },
    { id: "ST", name: "Stimulation", description: "Excitement, novelty, and challenge.", highDescriptor: "drawn to adventure, variety, and new experiences", lowDescriptor: "preferring calm and familiarity to thrills", normMean: 3.2, normSd: 0.8 },
    { id: "HE", name: "Hedonism", description: "Pleasure and enjoyment of life.", highDescriptor: "valuing pleasure, fun, and enjoying the moment", lowDescriptor: "more duty- or goal-focused than pleasure-focused", normMean: 3.4, normSd: 0.7 },
    { id: "AC", name: "Achievement", description: "Personal success through demonstrating competence.", highDescriptor: "driven to succeed, excel, and be recognized", lowDescriptor: "less focused on status or external achievement", normMean: 3.6, normSd: 0.7 },
    { id: "PO", name: "Power", description: "Status, prestige, and control over people or resources.", highDescriptor: "valuing influence, authority, and leadership", lowDescriptor: "uninterested in dominance or status", normMean: 2.8, normSd: 0.8 },
    { id: "SE", name: "Security", description: "Safety, harmony, and stability.", highDescriptor: "valuing safety, order, and stability", lowDescriptor: "comfortable with risk and uncertainty", normMean: 3.7, normSd: 0.65 },
    { id: "CO", name: "Conformity", description: "Restraint of actions likely to upset others or violate norms.", highDescriptor: "valuing politeness, rules, and meeting expectations", lowDescriptor: "willing to break norms and go your own way", normMean: 3.2, normSd: 0.72 },
    { id: "TR", name: "Tradition", description: "Respect for and commitment to customs and ideas.", highDescriptor: "valuing tradition, humility, and continuity", lowDescriptor: "preferring the new and progressive to the traditional", normMean: 3.0, normSd: 0.8 },
    { id: "BE", name: "Benevolence", description: "Preserving and enhancing the welfare of close others.", highDescriptor: "devoted to the wellbeing of those close to you", lowDescriptor: "more self-focused than caretaking", normMean: 4.0, normSd: 0.55 },
    { id: "UN", name: "Universalism", description: "Understanding, tolerance, and protection for all people and nature.", highDescriptor: "caring about justice, equality, and the planet", lowDescriptor: "more focused on your own circle than the wider world", normMean: 3.8, normSd: 0.6 },
  ],
  items,
  caveats: [
    "Values aren't right or wrong — they're priorities. The insight is in your ranking, not any single score.",
    "Some values naturally trade off against each other (e.g., Security vs. Stimulation); tension between them is normal.",
    "A brief measure in the spirit of Schwartz's PVQ, not the full instrument.",
  ],
  citations: [
    { ref: "Schwartz, S. H. (1992). Universals in the content and structure of values. Advances in Experimental Social Psychology, 25, 1–65." },
    { ref: "Schwartz, S. H. (2012). An overview of the Schwartz theory of basic values. Online Readings in Psychology and Culture, 2(1)." },
  ],
};

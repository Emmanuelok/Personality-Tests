import type { Instrument, Item } from "../types";

/**
 * Locus of Control (internal vs. external).
 *
 * Rotter's (1966) classic construct: do you feel outcomes flow from your own
 * actions (internal) or from luck, fate, and powerful others (external)? Strongly
 * predicts coping, achievement, and wellbeing. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("L1", "What happens to me is mostly the result of my own actions.", "LOC"),
  it("L2", "I can shape my future through the choices I make.", "LOC"),
  it("L3", "When I work hard, I usually get the results I want.", "LOC"),
  it("L4", "If I prepare well, I can handle whatever comes.", "LOC"),
  it("L5", "Much of what happens to me is a matter of luck or fate.", "LOC", -1),
  it("L6", "No matter how hard I try, forces outside my control decide the outcome.", "LOC", -1),
  it("L7", "There's little point in planning — life is mostly chance.", "LOC", -1),
  it("L8", "Powerful other people largely determine what I can achieve.", "LOC", -1),
];

export const locus: Instrument = {
  id: "locus-of-control",
  name: "Locus of Control",
  shortName: "Locus",
  kind: "dimensional",
  category: "focused",
  tagline: "Do you steer your life, or does life happen to you?",
  description:
    "Locus of control is one of psychology's most enduring constructs: the degree to which you believe outcomes flow " +
    "from your own actions (an internal locus) versus from luck, fate, and powerful others (an external locus). A more " +
    "internal locus predicts better coping, achievement, and health — but the healthiest stance is realistic, owning " +
    "what you can while accepting what you can't.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Rotter's internal–external locus of control.",
  scales: [
    { id: "LOC", name: "Internal Locus", description: "Belief that your own actions drive your outcomes.", highDescriptor: "agentic — you feel in the driver's seat", lowDescriptor: "external — you feel outcomes are largely out of your hands", poles: { low: "External", high: "Internal" }, normMean: 3.5, normSd: 0.66 },
  ],
  items,
  caveats: [
    "Neither extreme is ideal: a very internal locus can mean self-blame for things genuinely outside your control; a very external one can sap motivation. Balance is healthiest.",
    "Locus of control is learnable — it shifts with experience, success, and how you interpret events.",
    "This is an educational self-reflection tool, not a clinical measure.",
  ],
  citations: [
    { ref: "Rotter, J. B. (1966). Generalized expectancies for internal versus external control of reinforcement. Psychological Monographs, 80(1), 1–28." },
    { ref: "Lefcourt, H. M. (1982). Locus of Control: Current Trends in Theory and Research. Erlbaum." },
  ],
};

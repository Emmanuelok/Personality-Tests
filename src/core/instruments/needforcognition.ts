import type { Instrument, Item } from "../types";

/**
 * Need for Cognition (Cacioppo & Petty).
 *
 * How much you enjoy and seek out effortful thinking. A well-validated trait that
 * predicts how you process information, resist persuasion, and approach problems.
 * Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("N1", "I genuinely enjoy tackling complex problems and thinking them through.", "NFC"),
  it("N2", "I find real satisfaction in long, hard mental effort.", "NFC"),
  it("N3", "Learning new ways to think excites me.", "NFC"),
  it("N4", "I prefer my life to be full of puzzles I have to solve.", "NFC"),
  it("N5", "Thinking hard is not my idea of fun.", "NFC", -1),
  it("N6", "I only think as much as I have to.", "NFC", -1),
  it("N7", "I'd rather do something that requires little thought than something challenging.", "NFC", -1),
  it("N8", "I try to avoid situations where I have to think deeply about something.", "NFC", -1),
];

export const needForCognition: Instrument = {
  id: "need-for-cognition",
  name: "Need for Cognition",
  shortName: "NFC",
  kind: "dimensional",
  category: "focused",
  tagline: "How much you enjoy the work of thinking.",
  description:
    "Need for Cognition is the degree to which you seek out and enjoy effortful thinking. People high in it relish " +
    "complex problems and weigh arguments carefully; people lower in it prefer cognitive shortcuts and concrete tasks. " +
    "It's not intelligence — it's appetite — but it shapes how you learn, decide, and resist (or fall for) persuasion.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Cacioppo & Petty's Need for Cognition Scale.",
  scales: [
    { id: "NFC", name: "Need for Cognition", description: "Tendency to enjoy and engage in effortful thinking.", highDescriptor: "you relish complexity and deep thinking", lowDescriptor: "you prefer the simple, concrete, and efficient", poles: { low: "Thinks as needed", high: "Loves to think" }, normMean: 3.3, normSd: 0.72 },
  ],
  items,
  caveats: [
    "Need for Cognition is about appetite for thinking, NOT how smart you are — plenty of sharp people prefer concrete, efficient tasks.",
    "Lower scorers aren't lazy thinkers; they often value getting to the point and acting. Each style has its place.",
    "This is an educational self-reflection tool, not a measure of ability or intelligence.",
  ],
  citations: [
    { ref: "Cacioppo, J. T., & Petty, R. E. (1982). The need for cognition. Journal of Personality and Social Psychology, 42(1), 116–131." },
    { ref: "Cacioppo, J. T., Petty, R. E., Feinstein, J. A., & Jarvis, W. B. G. (1996). Dispositional differences in cognitive motivation. Psychological Bulletin, 119(2), 197–253." },
  ],
};

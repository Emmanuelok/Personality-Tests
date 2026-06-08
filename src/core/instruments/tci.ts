import type { Instrument, Item } from "../types";

/**
 * Temperament and Character Inventory (Cloninger).
 *
 * Cloninger's psychobiological model splits personality into four heritable
 * TEMPERAMENT dimensions (automatic emotional responses) and three CHARACTER
 * dimensions (self-concept, which matures with development). Items are ORIGINAL
 * to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("NS1", "I'm always looking for new and exciting experiences.", "NS"),
  it("NS2", "I prefer familiar routines to novelty and surprise.", "NS", -1),
  it("HA1", "I worry about things that might go wrong, even when others don't.", "HA"),
  it("HA2", "I stay relaxed and confident in unfamiliar or risky situations.", "HA", -1),
  it("RD1", "I'm warm and sentimental, and I care about others' approval.", "RD"),
  it("RD2", "I stay emotionally detached and indifferent to praise or criticism.", "RD", -1),
  it("PS1", "I keep pushing toward a goal even when others would quit.", "PS"),
  it("PS2", "I lose motivation as soon as a task stops being rewarding.", "PS", -1),
  it("SD1", "I take responsibility for my life and act on my own purposes.", "SD"),
  it("SD2", "I struggle to set goals and follow my own direction.", "SD", -1),
  it("CO1", "I'm tolerant and helpful, and I try to understand other points of view.", "CO"),
  it("CO2", "I have little patience for people who are different from me.", "CO", -1),
  it("ST1", "I sometimes feel a deep connection to something larger than myself.", "ST"),
  it("ST2", "I focus on the concrete and material, not the spiritual or transcendent.", "ST", -1),
];

export const tci: Instrument = {
  id: "tci-cloninger",
  name: "Temperament & Character",
  shortName: "TCI",
  kind: "dimensional",
  category: "core",
  tagline: "Cloninger's model — what you inherited, and what you've grown.",
  description:
    "Cloninger's psychobiological model makes a striking distinction: four TEMPERAMENT dimensions that are largely " +
    "inherited and automatic (Novelty Seeking, Harm Avoidance, Reward Dependence, Persistence), and three CHARACTER " +
    "dimensions that mature through life (Self-Directedness, Cooperativeness, Self-Transcendence). Together they separate " +
    "the nature you start with from the self you've built.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Cloninger's Temperament and Character Inventory.",
  scales: [
    { id: "NS", name: "Novelty Seeking", description: "Temperament: exploratory excitement and impulsivity.", highDescriptor: "exploratory, impulsive, and excitable", lowDescriptor: "reserved, deliberate, and orderly", poles: { low: "Steady", high: "Novelty-seeking" }, normMean: 3.0, normSd: 0.74 },
    { id: "HA", name: "Harm Avoidance", description: "Temperament: worry, caution, and fear of harm.", highDescriptor: "cautious, worry-prone, and easily fatigued", lowDescriptor: "confident, relaxed, and risk-tolerant", poles: { low: "Bold", high: "Cautious" }, normMean: 3.0, normSd: 0.78 },
    { id: "RD", name: "Reward Dependence", description: "Temperament: warmth and sensitivity to social approval.", highDescriptor: "warm, sentimental, and approval-sensitive", lowDescriptor: "detached, practical, and independent of approval", poles: { low: "Detached", high: "Warm" }, normMean: 3.2, normSd: 0.72 },
    { id: "PS", name: "Persistence", description: "Temperament: perseverance despite frustration.", highDescriptor: "industrious, determined, and persevering", lowDescriptor: "easily discouraged when reward fades", poles: { low: "Yielding", high: "Persevering" }, normMean: 3.2, normSd: 0.74 },
    { id: "SD", name: "Self-Directedness", description: "Character: responsibility, purpose, and resourcefulness.", highDescriptor: "purposeful, responsible, and self-governing", lowDescriptor: "uncertain of direction and easily blame-shifting", poles: { low: "Adrift", high: "Self-directed" }, normMean: 3.4, normSd: 0.72 },
    { id: "CO", name: "Cooperativeness", description: "Character: tolerance, empathy, and helpfulness.", highDescriptor: "tolerant, empathic, and cooperative", lowDescriptor: "self-focused and intolerant of difference", poles: { low: "Self-focused", high: "Cooperative" }, normMean: 3.5, normSd: 0.68 },
    { id: "ST", name: "Self-Transcendence", description: "Character: spirituality and connection to a larger whole.", highDescriptor: "idealistic and attuned to something larger", lowDescriptor: "concrete, material, and self-contained", poles: { low: "Material", high: "Transcendent" }, normMean: 3.0, normSd: 0.8 },
  ],
  items,
  caveats: [
    "Temperament tends to be more stable and heritable; character matures with age and experience — so the character dimensions are especially open to growth.",
    "With two items per dimension this is a brief screen, not the full TCI; read it as a sketch.",
    "This is an educational self-reflection tool, not a clinical instrument (the full TCI is also used in clinical research).",
  ],
  citations: [
    { ref: "Cloninger, C. R., Svrakic, D. M., & Przybeck, T. R. (1993). A psychobiological model of temperament and character. Archives of General Psychiatry, 50(12), 975–990." },
    { ref: "Cloninger, C. R. (1994). The Temperament and Character Inventory (TCI): A Guide. Washington University." },
  ],
};

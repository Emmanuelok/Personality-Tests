import type { Instrument, Item, ScaleDef } from "../types";

/**
 * Sixteen Personality Factors (Cattell's 16PF tradition).
 *
 * Raymond Cattell used factor analysis to derive sixteen primary source traits.
 * This profiler measures all sixteen with two self-report items each. Items are
 * ORIGINAL to this platform. (Cattell's Factor B — Reasoning — is normally an
 * ability measure; here it is a brief self-rating, as noted in the caveats.)
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const scale = (id: string, name: string, low: string, high: string, description: string): ScaleDef => ({
  id, name, description,
  highDescriptor: high.toLowerCase(), lowDescriptor: low.toLowerCase(),
  poles: { low, high }, normMean: 3.0, normSd: 0.78,
});

const items: Item[] = [
  it("A1", "I warm up to people quickly and enjoy being close to others.", "A"),
  it("A2", "I tend to keep an emotional distance from people.", "A", -1),
  it("B1", "I pick up new and abstract ideas quickly.", "B"),
  it("B2", "I find it hard to follow complex or abstract reasoning.", "B", -1),
  it("C1", "I stay emotionally steady even when life gets hard.", "C"),
  it("C2", "My feelings are easily upset by everyday problems.", "C", -1),
  it("E1", "I assert myself and push for what I want.", "E"),
  it("E2", "I usually defer to others rather than take charge.", "E", -1),
  it("F1", "I'm spontaneous, lively, and enthusiastic.", "F"),
  it("F2", "I'm fairly serious and restrained.", "F", -1),
  it("G1", "I take duty, rules, and doing the proper thing seriously.", "G"),
  it("G2", "I bend rules when they get in my way.", "G", -1),
  it("H1", "I'm socially bold and venture easily into new groups.", "H"),
  it("H2", "I feel shy and hesitant in unfamiliar social situations.", "H", -1),
  it("I1", "I'm tender-minded and moved by beauty and feeling.", "I"),
  it("I2", "I rely on logic far more than sentiment when deciding.", "I", -1),
  it("L1", "I stay watchful because people can't always be trusted.", "L"),
  it("L2", "I generally assume people have good intentions.", "L", -1),
  it("M1", "I get absorbed in ideas and imagination and lose track of practicalities.", "M"),
  it("M2", "I keep my attention firmly on practical, here-and-now matters.", "M", -1),
  it("N1", "I keep my private thoughts to myself.", "N"),
  it("N2", "I'm open and forthright about myself with almost anyone.", "N", -1),
  it("O1", "I often worry that I've done something wrong.", "O"),
  it("O2", "I feel secure and rarely doubt myself.", "O", -1),
  it("Q11", "I like to try new approaches and question the established way.", "Q1"),
  it("Q12", "I prefer familiar, traditional ways of doing things.", "Q1", -1),
  it("Q21", "I prefer to make my own decisions and rely on myself.", "Q2"),
  it("Q22", "I'd rather do things together with a group than alone.", "Q2", -1),
  it("Q31", "I like things organized, planned, and done to a high standard.", "Q3"),
  it("Q32", "I'm comfortable leaving things loose and unstructured.", "Q3", -1),
  it("Q41", "I often feel tense, restless, or wound up.", "Q4"),
  it("Q42", "I feel relaxed and tranquil most of the time.", "Q4", -1),
];

export const sixteenPf: Instrument = {
  id: "sixteen-pf",
  name: "16 Personality Factors",
  shortName: "16PF",
  kind: "dimensional",
  category: "core",
  tagline: "Cattell's sixteen primary traits — the most granular map of normal personality.",
  description:
    "Raymond Cattell used factor analysis to distill personality into sixteen primary 'source traits'. This profiler " +
    "measures all sixteen — from Warmth and Dominance to Vigilance, Privateness, and Tension — giving an unusually " +
    "fine-grained portrait that the broader Big Five rolls up. A rich, detailed read for anyone who wants nuance.",
  estMinutes: 7,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Cattell's 16-factor model.",
  scales: [
    scale("A", "Warmth", "Reserved", "Warm", "Emotional closeness and warmth toward people."),
    scale("B", "Reasoning", "Concrete", "Abstract", "Self-rated quickness with abstract ideas."),
    scale("C", "Emotional Stability", "Reactive", "Stable", "Calmness and resilience under stress."),
    scale("E", "Dominance", "Deferential", "Assertive", "Assertiveness and drive to lead."),
    scale("F", "Liveliness", "Serious", "Lively", "Spontaneity, energy, and enthusiasm."),
    scale("G", "Rule-Consciousness", "Expedient", "Dutiful", "Respect for duty, rules, and propriety."),
    scale("H", "Social Boldness", "Shy", "Bold", "Boldness and ease in social situations."),
    scale("I", "Sensitivity", "Utilitarian", "Sensitive", "Tender-mindedness and aesthetic feeling."),
    scale("L", "Vigilance", "Trusting", "Vigilant", "Watchfulness and wariness of others."),
    scale("M", "Abstractedness", "Grounded", "Imaginative", "Absorption in ideas vs. practical focus."),
    scale("N", "Privateness", "Forthright", "Private", "Guardedness about one's inner life."),
    scale("O", "Apprehension", "Self-assured", "Apprehensive", "Self-doubt, worry, and guilt-proneness."),
    scale("Q1", "Openness to Change", "Traditional", "Open", "Appetite for novelty and questioning."),
    scale("Q2", "Self-Reliance", "Group-oriented", "Self-reliant", "Preference for solitude and autonomy."),
    scale("Q3", "Perfectionism", "Flexible", "Organized", "Need for order, planning, and standards."),
    scale("Q4", "Tension", "Relaxed", "Tense", "Restlessness and nervous tension."),
  ],
  items,
  caveats: [
    "With two items per factor this is a brief screen, not the full 16PF — read it as a sketch, not a precise score.",
    "Factor B (Reasoning) is normally an ability test; here it's a quick self-rating, so treat it loosely.",
    "The 16PF is a copyrighted instrument; these are original items inspired by Cattell's factor model, for education and self-reflection.",
  ],
  citations: [
    { ref: "Cattell, R. B., Eber, H. W., & Tatsuoka, M. M. (1970). Handbook for the 16PF. IPAT." },
    { ref: "Cattell, H. E. P., & Mead, A. D. (2008). The Sixteen Personality Factor Questionnaire (16PF). In The SAGE Handbook of Personality Theory and Assessment, Vol. 2." },
  ],
};

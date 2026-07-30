import type { Instrument, Item } from "../types";

/**
 * Big Five Aspect Scales (BFAS).
 *
 * DeYoung, Quilty & Peterson (2007) showed each Big Five domain splits into two
 * distinct "aspects" — a layer of resolution between the five broad domains and
 * their many narrow facets. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("INT1", "I quickly grasp abstract or complex ideas.", "INT"),
  it("INT2", "I avoid difficult, philosophical discussions.", "INT", -1),
  it("AES1", "I'm deeply moved by art, music, or natural beauty.", "AES"),
  it("AES2", "I rarely lose myself in imagination or fantasy.", "AES", -1),
  it("IND1", "I push myself to get things done and finish what I start.", "IND"),
  it("IND2", "I often put off tasks and struggle to follow through.", "IND", -1),
  it("ORD1", "I like to keep things tidy, scheduled, and organized.", "ORD"),
  it("ORD2", "I tend to leave my things in a mess.", "ORD", -1),
  it("ENT1", "I'm cheerful and make friends easily.", "ENT"),
  it("ENT2", "I rarely feel bubbly or excited.", "ENT", -1),
  it("ASR1", "I take charge and speak up in groups.", "ASR"),
  it("ASR2", "I hold back from leading or asserting myself.", "ASR", -1),
  it("COM1", "I feel others' emotions and care about their wellbeing.", "COM"),
  it("COM2", "I'm not much affected by other people's problems.", "COM", -1),
  it("POL1", "I avoid stepping on others and respect their wishes.", "POL"),
  it("POL2", "I can be confrontational or pushy.", "POL", -1),
  it("VOL1", "I get irritated or upset easily.", "VOL"),
  it("VOL2", "I keep my temper even when provoked.", "VOL", -1),
  it("WTH1", "I often feel anxious, down, or discouraged.", "WTH"),
  it("WTH2", "I rarely feel sad or overwhelmed.", "WTH", -1),
];

const scale = (id: string, name: string, low: string, high: string, description: string, highD: string, lowD: string) =>
  ({ id, name, description, highDescriptor: highD, lowDescriptor: lowD, poles: { low, high }, normMean: 3.1, normSd: 0.8 });

export const bigFiveAspects: Instrument = {
  id: "big-five-aspects",
  name: "Big Five Aspects",
  shortName: "BFAS",
  kind: "dimensional",
  category: "core",
  tagline: "Ten aspects — the layer of detail between the Big Five and its facets.",
  description:
    "Each Big Five domain actually contains two distinct 'aspects' — for example, Conscientiousness splits into " +
    "Industriousness and Orderliness, and Neuroticism into Volatility and Withdrawal. This profiler measures all ten, " +
    "giving you a sharper, more actionable read than the five broad domains alone — and showing where two sides of the " +
    "same trait pull in different directions.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in DeYoung, Quilty & Peterson's Big Five Aspect Scales.",
  scales: [
    scale("INT", "Intellect", "Concrete", "Intellectual", "Engagement with ideas and reasoning (aspect of Openness).", "idea-driven and quick with the abstract", "practical and uninterested in abstraction"),
    scale("AES", "Openness", "Conventional", "Imaginative", "Aesthetic sensitivity and imagination (aspect of Openness).", "imaginative and moved by beauty", "down-to-earth and literal"),
    scale("IND", "Industriousness", "Easygoing", "Driven", "Drive to work and achieve (aspect of Conscientiousness).", "hard-working and persistent", "relaxed and easily sidetracked"),
    scale("ORD", "Orderliness", "Flexible", "Orderly", "Need for order and routine (aspect of Conscientiousness).", "tidy, planned, and structured", "loose, spontaneous, and untidy"),
    scale("ENT", "Enthusiasm", "Reserved", "Enthusiastic", "Sociability and positive emotion (aspect of Extraversion).", "warm, outgoing, and cheerful", "quiet and emotionally contained"),
    scale("ASR", "Assertiveness", "Deferential", "Assertive", "Drive to lead and influence (aspect of Extraversion).", "forceful, take-charge, and visible", "modest and behind-the-scenes"),
    scale("COM", "Compassion", "Detached", "Compassionate", "Emotional concern for others (aspect of Agreeableness).", "empathic and caring", "cool and emotionally separate"),
    scale("POL", "Politeness", "Challenging", "Polite", "Respect for others and restraint (aspect of Agreeableness).", "deferential and non-confrontational", "blunt, challenging, and pushy"),
    scale("VOL", "Volatility", "Even", "Volatile", "Irritability and emotional swings (aspect of Neuroticism).", "easily upset and quick to anger", "calm and slow to anger"),
    scale("WTH", "Withdrawal", "Resilient", "Withdrawn", "Anxiety and depressive feeling (aspect of Neuroticism).", "prone to worry and low mood", "steady, hopeful, and hard to discourage"),
  ],
  items,
  caveats: [
    "Aspects are broader than facets but finer than domains; with two items each, read them as a sketch, not a precise score.",
    "Two aspects of the same trait can diverge — that contrast is often the most useful thing here.",
    "This is an educational self-reflection tool, not a clinical instrument.",
  ],
  citations: [
    { ref: "DeYoung, C. G., Quilty, L. C., & Peterson, J. B. (2007). Between facets and domains: 10 aspects of the Big Five. Journal of Personality and Social Psychology, 93(5), 880–896." },
  ],
};

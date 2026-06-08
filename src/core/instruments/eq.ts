import type { Instrument, Item } from "../types";

/**
 * Emotional Intelligence (five domains).
 *
 * A self-report measure of trait emotional intelligence across the five domains
 * popularized by Goleman and rooted in Salovey & Mayer's ability model and the
 * trait-EI tradition (Petrides). Items are ORIGINAL to this platform. EI is highly
 * trainable, which makes it one of the most actionable profiles for daily life.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Self-Awareness
  it("SA1", "I can usually name exactly what I'm feeling, and why.", "SA", 1),
  it("SA2", "I'm aware of how my moods shape my behavior.", "SA", 1),
  it("SA3", "I'm often caught off guard by my own emotional reactions.", "SA", -1),
  it("SA4", "I know my emotional strengths and my triggers well.", "SA", 1),
  // Self-Regulation
  it("SR1", "I can stay calm and composed under pressure.", "SR", 1),
  it("SR2", "When I'm upset, I can soothe myself and refocus.", "SR", 1),
  it("SR3", "I often say or do things in the heat of the moment that I later regret.", "SR", -1),
  it("SR4", "I can delay gratification to reach a bigger goal.", "SR", 1),
  // Motivation
  it("MO1", "I stay driven toward my goals even without outside rewards.", "MO", 1),
  it("MO2", "I bounce back quickly from setbacks.", "MO", 1),
  it("MO3", "I lose motivation as soon as things get hard.", "MO", -1),
  it("MO4", "I'm optimistic that effort will eventually pay off.", "MO", 1),
  // Empathy
  it("EM1", "I can sense how others are feeling, even when they don't say it.", "EM", 1),
  it("EM2", "I genuinely tune in to other people's perspectives.", "EM", 1),
  it("EM3", "I find it hard to understand why people feel the way they do.", "EM", -1),
  it("EM4", "I pick up on subtle cues in tone and body language.", "EM", 1),
  // Social Skills
  it("SS1", "I handle conflicts and difficult conversations well.", "SS", 1),
  it("SS2", "I can build rapport with almost anyone.", "SS", 1),
  it("SS3", "I'm good at influencing and inspiring people.", "SS", 1),
  it("SS4", "I find social situations awkward and hard to manage.", "SS", -1),
];

export const eq: Instrument = {
  id: "emotional-intelligence",
  name: "Emotional Intelligence (EQ)",
  shortName: "EQ",
  kind: "dimensional",
  category: "emotional",
  tagline: "The most trainable predictor of relationships, leadership, and wellbeing.",
  description:
    "Emotional intelligence is the ability to recognize, understand, and manage emotions — your own and " +
    "others'. This profiler estimates five domains: Self-Awareness, Self-Regulation, Motivation, Empathy, " +
    "and Social Skills. Unlike IQ, EQ is highly learnable, so every domain here doubles as a growth target.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the EI literature (Salovey & Mayer; Goleman; Petrides).",
  scales: [
    { id: "SA", name: "Self-Awareness", description: "Recognizing your own emotions and their effects.", highDescriptor: "tuned in to your feelings and how they drive you", lowDescriptor: "less reflective about your inner emotional states", poles: { low: "Unaware", high: "Self-aware" }, normMean: 3.5, normSd: 0.62 },
    { id: "SR", name: "Self-Regulation", description: "Managing impulses and recovering from difficult emotions.", highDescriptor: "composed, self-controlled, and able to reset under stress", lowDescriptor: "more reactive and impulsive when emotions run high", poles: { low: "Reactive", high: "Composed" }, normMean: 3.4, normSd: 0.64 },
    { id: "MO", name: "Motivation", description: "Drive, optimism, and resilience toward goals.", highDescriptor: "driven, optimistic, and quick to bounce back", lowDescriptor: "more easily discouraged when motivation dips", poles: { low: "Easily discouraged", high: "Driven" }, normMean: 3.5, normSd: 0.62 },
    { id: "EM", name: "Empathy", description: "Sensing and understanding others' feelings.", highDescriptor: "perceptive and attuned to what others feel", lowDescriptor: "less naturally attuned to others' emotions", poles: { low: "Detached", high: "Empathic" }, normMean: 3.7, normSd: 0.6 },
    { id: "SS", name: "Social Skills", description: "Managing relationships, influence, and conflict.", highDescriptor: "socially skilled, persuasive, and good with conflict", lowDescriptor: "less at ease navigating social dynamics", poles: { low: "Awkward", high: "Skilled" }, normMean: 3.4, normSd: 0.66 },
  ],
  items,
  caveats: [
    "Self-reported EI reflects how you see yourself; others' feedback (360°) is a valuable complement.",
    "Every domain here is trainable with deliberate practice — treat low scores as opportunities, not limits.",
  ],
  citations: [
    { ref: "Salovey, P., & Mayer, J. D. (1990). Emotional intelligence. Imagination, Cognition and Personality, 9(3), 185–211." },
    { ref: "Goleman, D. (1995). Emotional Intelligence. Bantam Books." },
    { ref: "Petrides, K. V., & Furnham, A. (2001). Trait emotional intelligence. European Journal of Personality, 15(6), 425–448." },
  ],
};

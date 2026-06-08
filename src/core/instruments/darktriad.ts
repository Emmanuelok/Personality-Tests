import type { Instrument, Item } from "../types";

/**
 * Dark Triad (Machiavellianism · Narcissism · Psychopathy).
 *
 * Three offensive-but-non-pathological personality traits studied together since
 * Paulhus & Williams (2002) and measured compactly by the SD3 (Jones & Paulhus,
 * 2014). Items here are ORIGINAL to this platform and measure NORMAL-RANGE
 * tendencies — high scores are not a diagnosis of any disorder.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Machiavellianism — strategic manipulation, cynicism
  it("M1", "It's wise to keep some information about yourself in reserve for when it's useful.", "MACH"),
  it("M2", "I'm willing to steer a situation to get the outcome I want.", "MACH"),
  it("M3", "Most people can be won over with the right approach — and I use that.", "MACH"),
  it("M4", "I prefer to work behind the scenes rather than confront people directly.", "MACH"),
  it("M5", "It's smart to wait for the right moment to get back at someone.", "MACH"),
  it("M6", "I make sure my plans serve my interests, even if I don't advertise it.", "MACH"),
  // Narcissism — grandiosity, need for admiration
  it("N1", "People see me as a natural leader — and I agree.", "NARC"),
  it("N2", "I like to be the center of attention.", "NARC"),
  it("N3", "I have a strong sense that I'm special or exceptional.", "NARC"),
  it("N4", "I enjoy being admired, and it bothers me when I'm not.", "NARC"),
  it("N5", "I expect a fair amount of recognition for what I do.", "NARC"),
  it("N6", "I'm more capable than most of the people around me.", "NARC"),
  // Psychopathy — callousness, impulsivity, thrill-seeking
  it("P1", "I tend to act on impulse without worrying much about the consequences.", "PSYCH"),
  it("P2", "I'm not easily moved by other people's suffering.", "PSYCH"),
  it("P3", "I like to take risks and chase thrills.", "PSYCH"),
  it("P4", "Getting payback can be satisfying.", "PSYCH"),
  it("P5", "I rarely feel guilty, even when I probably should.", "PSYCH"),
  it("P6", "Rules feel more like suggestions to me.", "PSYCH"),
];

export const darkTriad: Instrument = {
  id: "dark-triad-18",
  name: "The Dark Triad",
  shortName: "Dark Triad",
  kind: "dimensional",
  category: "shadow",
  tagline: "Three shadow traits — measured honestly, for insight, not judgment.",
  description:
    "The Dark Triad — Machiavellianism (strategic manipulation), Narcissism (grandiosity and need for " +
    "admiration), and Psychopathy (callousness and impulsivity) — captures the 'darker' side of normal " +
    "personality. Seeing your levels clearly is a route to self-awareness, not a verdict on your character.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Dark Triad constructs (Paulhus & Williams; Jones & Paulhus's SD3). Measures normal-range tendencies.",
  scales: [
    { id: "MACH", name: "Machiavellianism", description: "Strategic, calculating, and willing to manipulate to reach goals.", highDescriptor: "strategic, guarded, and comfortable maneuvering to get results", lowDescriptor: "straightforward, trusting, and uninterested in manipulation", poles: { low: "Straightforward", high: "Strategic" }, normMean: 2.9, normSd: 0.7 },
    { id: "NARC", name: "Narcissism", description: "Grandiosity, self-importance, and a need for admiration.", highDescriptor: "self-assured, attention-seeking, and hungry for recognition", lowDescriptor: "modest, self-effacing, and comfortable out of the spotlight", poles: { low: "Modest", high: "Grandiose" }, normMean: 2.8, normSd: 0.7 },
    { id: "PSYCH", name: "Psychopathy", description: "Callousness, impulsivity, and thrill-seeking (normal range).", highDescriptor: "bold, impulsive, thrill-seeking, and low on guilt or empathy", lowDescriptor: "cautious, empathic, and conscientious about others", poles: { low: "Empathic", high: "Callous" }, normMean: 2.2, normSd: 0.68 },
  ],
  items,
  caveats: [
    "This measures NORMAL-RANGE traits. A high score is not a clinical diagnosis of any disorder.",
    "Everyone sits somewhere on these dimensions; some strategic or bold tendencies can be adaptive.",
    "Answer candidly — these traits are easy to under-report. The value is honest self-insight.",
  ],
  citations: [
    { ref: "Paulhus, D. L., & Williams, K. M. (2002). The Dark Triad of personality: Narcissism, Machiavellianism, and psychopathy. Journal of Research in Personality, 36(6), 556–563." },
    { ref: "Jones, D. N., & Paulhus, D. L. (2014). Introducing the Short Dark Triad (SD3): A brief measure of dark personality traits. Assessment, 21(1), 28–41." },
  ],
};

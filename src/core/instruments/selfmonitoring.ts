import type { Instrument, Item } from "../types";

/**
 * Self-Monitoring (Snyder).
 *
 * How much you observe and adjust your self-presentation to fit the social
 * situation. High self-monitors are social chameleons; low self-monitors stay
 * consistent across settings. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("M1", "In social situations, I adjust my behavior to fit whoever I'm with.", "SM"),
  it("M2", "I'm good at reading a room and acting accordingly.", "SM"),
  it("M3", "I can present myself quite differently depending on the situation.", "SM"),
  it("M4", "I can look someone in the eye and tell a harmless white lie with a straight face.", "SM"),
  it("M5", "I'd probably make a decent actor.", "SM"),
  it("M6", "My behavior is usually an honest expression of how I truly feel, whatever the setting.", "SM", -1),
  it("M7", "I find it hard to change my behavior to suit different people and situations.", "SM", -1),
  it("M8", "I rarely put on an act to impress or please people.", "SM", -1),
];

export const selfMonitoring: Instrument = {
  id: "self-monitoring",
  name: "Self-Monitoring",
  shortName: "Self-Monitor",
  kind: "dimensional",
  category: "focused",
  tagline: "Social chameleon or the same in every room?",
  description:
    "Self-monitoring, a classic social-psychology construct from Mark Snyder, captures how much you watch and tune your " +
    "self-presentation to fit the moment. High self-monitors read situations and flex to suit them; low self-monitors " +
    "stay true to their inner state across settings. Each has real social advantages — and costs.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Snyder's Self-Monitoring Scale.",
  scales: [
    { id: "SM", name: "Self-Monitoring", description: "Tendency to observe and adjust self-presentation to the situation.", highDescriptor: "adaptive and situation-reading (a social chameleon)", lowDescriptor: "consistent and true-to-self across settings", poles: { low: "Consistent", high: "Adaptive" }, normMean: 3.0, normSd: 0.7 },
  ],
  items,
  caveats: [
    "Neither end is better: high self-monitors flex and fit in; low self-monitors are authentic and predictable. The skill is choosing consciously.",
    "High self-monitoring is about social attunement, not dishonesty — though it can shade that way if used to manipulate.",
    "This is an educational self-reflection tool, not a clinical measure.",
  ],
  citations: [
    { ref: "Snyder, M. (1974). Self-monitoring of expressive behavior. Journal of Personality and Social Psychology, 30(4), 526–537." },
    { ref: "Gangestad, S. W., & Snyder, M. (2000). Self-monitoring: Appraisal and reappraisal. Psychological Bulletin, 126(4), 530–555." },
  ],
};

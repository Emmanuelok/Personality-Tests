import type { Instrument, Item } from "../types";

/**
 * Hope (Snyder's Adult Hope Scale).
 *
 * Snyder defined hope not as a mood but as goal-directed thinking with two parts:
 * AGENCY (the motivation and drive to pursue goals) and PATHWAYS (the perceived
 * ability to find routes to them). Both are needed; hope is highest when they
 * reinforce each other. Items are ORIGINAL to this platform, grounded in Snyder
 * et al. (1991).
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("A1", "I energetically pursue the goals I set.", "AGENCY"),
  it("A2", "Even when discouraged, I keep going toward what I want.", "AGENCY"),
  it("A3", "I feel driven to meet the goals I care about.", "AGENCY"),
  it("A4", "My past experiences give me confidence for the future.", "AGENCY"),
  it("A5", "I can usually find the motivation to keep at a goal.", "AGENCY"),
  it("A6", "Once I commit to a goal, I follow through.", "AGENCY"),
  it("W1", "I can think of many ways to reach my goals.", "PATHWAYS"),
  it("W2", "When I'm stuck, I can find a way around the obstacle.", "PATHWAYS"),
  it("W3", "There are lots of ways around any problem.", "PATHWAYS"),
  it("W4", "I can usually find several routes to what I want.", "PATHWAYS"),
  it("W5", "When one approach fails, I think up another.", "PATHWAYS"),
  it("W6", "I'm resourceful at finding paths toward my goals.", "PATHWAYS"),
];

export const hope: Instrument = {
  id: "hope-scale",
  name: "Hope (Agency & Pathways)",
  shortName: "Hope",
  kind: "dimensional",
  category: "emotional",
  tagline: "The will and the way — two halves of how you pursue goals.",
  description:
    "In Snyder's model, hope isn't wishful feeling — it's how you think about goals. It has two engines: AGENCY, the " +
    "drive and willpower to pursue what you want, and PATHWAYS, the knack for finding routes to get there. Strong hope " +
    "needs both. This profiler shows the balance between your will and your way, and both halves grow with practice.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Adult Hope Scale (Snyder et al., 1991).",
  scales: [
    { id: "AGENCY", name: "Agency (the will)", description: "Goal-directed energy and determination.", highDescriptor: "driven and persistent toward your goals", lowDescriptor: "lower on goal-directed drive right now", poles: { low: "Low drive", high: "Driven" }, normMean: 3.6, normSd: 0.74 },
    { id: "PATHWAYS", name: "Pathways (the way)", description: "Ability to generate routes to your goals.", highDescriptor: "resourceful at finding ways around obstacles", lowDescriptor: "fewer routes to your goals come readily to mind", poles: { low: "Few routes", high: "Resourceful" }, normMean: 3.6, normSd: 0.72 },
  ],
  items,
  caveats: [
    "Hope here is a way of thinking about goals, not a measure of optimism or mood — and it's one of the more trainable mindsets.",
    "If your two scores differ, that's the useful signal: lots of will but few routes (or vice versa) points to exactly what to build.",
    "An educational self-reflection tool, not a clinical assessment.",
  ],
  citations: [
    { ref: "Snyder, C. R., et al. (1991). The will and the ways: development and validation of an individual-differences measure of hope. Journal of Personality and Social Psychology, 60(4), 570–585." },
    { ref: "Snyder, C. R. (2002). Hope theory: Rainbows in the mind. Psychological Inquiry, 13(4), 249–275." },
  ],
};

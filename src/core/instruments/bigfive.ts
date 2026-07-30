import type { Instrument, Item } from "../types";

/**
 * Big Five — IPIP-50 (Goldberg's IPIP Big-Five Factor Markers).
 *
 * Items are the public-domain International Personality Item Pool (IPIP)
 * Big-Five Factor Markers (50 items, 10 per factor). The IPIP is explicitly
 * public domain ("you can use it for any purpose without asking permission").
 *
 * Response format: 1 = Very Inaccurate … 5 = Very Accurate.
 *
 * Keys below follow the canonical scoring (high score = high trait). Neuroticism
 * is keyed toward Neuroticism (high = more reactive / less emotionally stable).
 */

const L = { min: 1, max: 5, labels: ["Very inaccurate", "Moderately inaccurate", "Neither", "Moderately accurate", "Very accurate"] };

// Helper to build an item.
const it = (id: string, text: string, scale: string, keyed: 1 | -1): Item => ({ id, text, scale, keyed });

// Canonical IPIP-50, interleaved E,A,C,N,O order.
const items: Item[] = [
  it("E1", "Am the life of the party.", "E", 1),
  it("A1", "Feel little concern for others.", "A", -1),
  it("C1", "Am always prepared.", "C", 1),
  it("N1", "Get stressed out easily.", "N", 1),
  it("O1", "Have a rich vocabulary.", "O", 1),
  it("E2", "Don't talk a lot.", "E", -1),
  it("A2", "Am interested in people.", "A", 1),
  it("C2", "Leave my belongings around.", "C", -1),
  it("N2", "Am relaxed most of the time.", "N", -1),
  it("O2", "Have difficulty understanding abstract ideas.", "O", -1),
  it("E3", "Feel comfortable around people.", "E", 1),
  it("A3", "Insult people.", "A", -1),
  it("C3", "Pay attention to details.", "C", 1),
  it("N3", "Worry about things.", "N", 1),
  it("O3", "Have a vivid imagination.", "O", 1),
  it("E4", "Keep in the background.", "E", -1),
  it("A4", "Sympathize with others' feelings.", "A", 1),
  it("C4", "Make a mess of things.", "C", -1),
  it("N4", "Seldom feel blue.", "N", -1),
  it("O4", "Am not interested in abstract ideas.", "O", -1),
  it("E5", "Start conversations.", "E", 1),
  it("A5", "Am not interested in other people's problems.", "A", -1),
  it("C5", "Get chores done right away.", "C", 1),
  it("N5", "Am easily disturbed.", "N", 1),
  it("O5", "Have excellent ideas.", "O", 1),
  it("E6", "Have little to say.", "E", -1),
  it("A6", "Have a soft heart.", "A", 1),
  it("C6", "Often forget to put things back in their proper place.", "C", -1),
  it("N6", "Get upset easily.", "N", 1),
  it("O6", "Do not have a good imagination.", "O", -1),
  it("E7", "Talk to a lot of different people at parties.", "E", 1),
  it("A7", "Am not really interested in others.", "A", -1),
  it("C7", "Like order.", "C", 1),
  it("N7", "Change my mood a lot.", "N", 1),
  it("O7", "Am quick to understand things.", "O", 1),
  it("E8", "Don't like to draw attention to myself.", "E", -1),
  it("A8", "Take time out for others.", "A", 1),
  it("C8", "Shirk my duties.", "C", -1),
  it("N8", "Have frequent mood swings.", "N", 1),
  it("O8", "Use difficult words.", "O", 1),
  it("E9", "Don't mind being the center of attention.", "E", 1),
  it("A9", "Feel others' emotions.", "A", 1),
  it("C9", "Follow a schedule.", "C", 1),
  it("N9", "Get irritated easily.", "N", 1),
  it("O9", "Spend time reflecting on things.", "O", 1),
  it("E10", "Am quiet around strangers.", "E", -1),
  it("A10", "Make people feel at ease.", "A", 1),
  it("C10", "Am exacting in my work.", "C", 1),
  it("N10", "Often feel blue.", "N", 1),
  it("O10", "Am full of ideas.", "O", 1),
];

export const bigFive: Instrument = {
  id: "big-five-ipip50",
  name: "Big Five Personality (IPIP-50)",
  shortName: "Big Five",
  kind: "dimensional",
  category: "core",
  tagline: "The scientific gold standard: five broad dimensions of personality.",
  description:
    "The Five-Factor Model is the most empirically validated framework in personality science. " +
    "This version uses Goldberg's public-domain IPIP Big-Five Factor Markers (50 items) to describe " +
    "where your keyed responses fall within the answer range for Openness, Conscientiousness, " +
    "Extraversion, Agreeableness, and Neuroticism.",
  estMinutes: 8,
  responseFormat: L,
  itemProvenance:
    "Verbatim public-domain items from the International Personality Item Pool (IPIP) Big-Five Factor Markers (Goldberg, 1992).",
  scales: [
    {
      id: "O",
      name: "Openness to Experience",
      description: "Receptivity to new ideas, aesthetics, imagination, and intellectual exploration.",
      highDescriptor: "curious, imaginative, intellectually adventurous, drawn to novelty and nuance",
      lowDescriptor: "practical, conventional, grounded in the concrete and the proven",
      poles: { low: "Conventional", high: "Inventive" },
      normMean: 3.8,
      normSd: 0.6,
    },
    {
      id: "C",
      name: "Conscientiousness",
      description: "The tendency toward organization, diligence, planning, and impulse control.",
      highDescriptor: "organized, dependable, disciplined, goal-directed",
      lowDescriptor: "flexible, spontaneous, comfortable with the unplanned",
      poles: { low: "Spontaneous", high: "Disciplined" },
      normMean: 3.5,
      normSd: 0.7,
    },
    {
      id: "E",
      name: "Extraversion",
      description: "The drive toward social engagement, stimulation, assertiveness, and positive affect.",
      highDescriptor: "outgoing, energetic, socially bold, enlivened by company",
      lowDescriptor: "reserved, measured, restored by solitude and depth",
      poles: { low: "Introverted", high: "Extraverted" },
      normMean: 3.2,
      normSd: 0.8,
    },
    {
      id: "A",
      name: "Agreeableness",
      description: "Orientation toward compassion, cooperation, trust, and consideration of others.",
      highDescriptor: "warm, cooperative, empathic, quick to give the benefit of the doubt",
      lowDescriptor: "frank, skeptical, competitive, willing to prioritize the task over harmony",
      poles: { low: "Challenging", high: "Compassionate" },
      normMean: 3.8,
      normSd: 0.6,
    },
    {
      id: "N",
      name: "Neuroticism",
      description: "The tendency to experience negative emotion, stress reactivity, and mood instability.",
      highDescriptor: "emotionally reactive, sensitive to stress, prone to worry and mood shifts",
      lowDescriptor: "calm, even-keeled, resilient under pressure",
      poles: { low: "Emotionally stable", high: "Reactive" },
      normMean: 2.9,
      normSd: 0.8,
    },
  ],
  items,
  caveats: [
    "Scores are estimates from self-report, not a clinical diagnosis.",
    "Scale positions describe this instrument's response range; they are not population rankings.",
    "Traits describe tendencies, not destiny — context and growth meaningfully shape behavior.",
  ],
  citations: [
    {
      ref: "Goldberg, L. R. (1992). The development of markers for the Big-Five factor structure. Psychological Assessment, 4(1), 26–42.",
      note: "Origin of the adjective/phrase markers underlying these items.",
    },
    {
      ref: "Goldberg, L. R., Johnson, J. A., Eber, H. W., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. Journal of Research in Personality, 40(1), 84–96.",
      note: "The public-domain item pool these 50 items are drawn from.",
      url: "https://ipip.ori.org/",
    },
    {
      ref: "Costa, P. T., & McCrae, R. R. (1992). Revised NEO Personality Inventory (NEO-PI-R) manual. Psychological Assessment Resources.",
      note: "Foundational five-factor framework and facet structure.",
    },
    {
      ref: "John, O. P., & Srivastava, S. (1999). The Big Five trait taxonomy. In Handbook of Personality (2nd ed., pp. 102–138). Guilford.",
      note: "Reference overview of the Five-Factor Model.",
    },
  ],
};

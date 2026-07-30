import type { Instrument, Item } from "../types";

/**
 * Optimism (Life Orientation — Revised, LOT-R).
 *
 * Dispositional optimism — the generalized expectancy that good things will
 * happen — is one of the most robust predictors of wellbeing, coping, and even
 * physical health. Modeled here as two related scales (Optimism and Pessimism),
 * which research shows are separable, not just opposite ends of one line. Items
 * are ORIGINAL to this platform, grounded in Scheier, Carver & Bridges (1994).
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("O1", "In uncertain times, I usually expect the best.", "OPT"),
  it("O2", "I'm generally optimistic about my future.", "OPT"),
  it("O3", "Overall, I expect more good things to happen to me than bad.", "OPT"),
  it("O4", "I usually believe that things will work out in the end.", "OPT"),
  it("O5", "When I start something new, I expect it to go well.", "OPT"),
  it("O6", "I can usually find the bright side of a hard situation.", "OPT"),
  it("P1", "If something can go wrong for me, it will.", "PES"),
  it("P2", "I hardly ever expect things to go my way.", "PES"),
  it("P3", "I rarely count on good things happening to me.", "PES"),
  it("P4", "I tend to brace for the worst.", "PES"),
  it("P5", "Setbacks make me doubt that things will improve.", "PES"),
  it("P6", "I often expect to be disappointed.", "PES"),
];

export const optimism: Instrument = {
  id: "optimism-lotr",
  name: "Optimism (Life Orientation)",
  shortName: "Optimism",
  kind: "dimensional",
  category: "emotional",
  tagline: "Do you expect the best, brace for the worst — or both?",
  description:
    "Dispositional optimism is the broad expectancy that good things lie ahead, and it's among the most reliable " +
    "predictors of resilience, coping, and wellbeing. This profiler measures Optimism and Pessimism as two separable " +
    "tendencies — many people carry some of each — and frames both as outlooks you can shift with practice, not fixed fates.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Life Orientation Test–Revised (Scheier, Carver & Bridges, 1994).",
  scales: [
    { id: "OPT", name: "Optimism", description: "Generalized expectancy that good outcomes lie ahead.", highDescriptor: "expecting good outcomes and looking on the bright side", lowDescriptor: "guarded and measured about what's ahead", poles: { low: "Guarded", high: "Optimistic" }, normMean: 3.5, normSd: 0.8 },
    { id: "PES", name: "Pessimism", description: "Generalized expectancy that things will go wrong.", highDescriptor: "bracing for disappointment and expecting setbacks", lowDescriptor: "rarely anticipating the worst", poles: { low: "Hopeful", high: "Pessimistic" }, normMean: 2.6, normSd: 0.85 },
  ],
  items,
  caveats: [
    "Optimism is a tendency, not a duty — and 'defensive pessimism' genuinely helps some people prepare and perform.",
    "Outlook is learnable: cognitive reappraisal, gratitude, and noticing your explanatory style all shift it over time.",
    "This is an educational self-reflection tool, not a clinical measure of mood.",
  ],
  citations: [
    { ref: "Scheier, M. F., Carver, C. S., & Bridges, M. W. (1994). Distinguishing optimism from neuroticism: the Life Orientation Test–Revised. Journal of Personality and Social Psychology, 67(6), 1063–1078." },
    { ref: "Carver, C. S., Scheier, M. F., & Segerstrom, S. C. (2010). Optimism. Clinical Psychology Review, 30(7), 879–889." },
  ],
};

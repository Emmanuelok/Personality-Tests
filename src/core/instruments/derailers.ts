import type { Instrument, Item } from "../types";

/**
 * Career Derailers (the "dark side" of strengths under stress).
 *
 * In the Hogan Development Survey tradition, derailers are strengths overused —
 * tendencies that help day-to-day but quietly undermine us under pressure or when
 * we stop paying attention. Original measure inspired by the HDS; not affiliated
 * with Hogan Assessment Systems.
 */

const L = { min: 1, max: 5, labels: ["Rarely / never", "Occasionally", "Sometimes", "Often", "Almost always"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("VOL1", "Under stress I can blow up, snap, or lose my cool.", "VOL"),
  it("VOL2", "I stay even-tempered even when things go badly.", "VOL", -1),
  it("SKE1", "I'm quick to suspect other people's motives.", "SKE"),
  it("SKE2", "I readily give people the benefit of the doubt.", "SKE", -1),
  it("CAU1", "Fear of making a mistake makes me hesitate to act or decide.", "CAU"),
  it("CAU2", "I make decisions readily without over-worrying.", "CAU", -1),
  it("BOL1", "I'm very confident in my abilities — perhaps more than I should be.", "BOL"),
  it("BOL2", "I readily admit when I'm wrong or out of my depth.", "BOL", -1),
  it("MIS1", "I enjoy testing limits and taking risks others would avoid.", "MIS"),
  it("MIS2", "I play it safe and stick to the rules.", "MIS", -1),
  it("PER1", "My standards are so high that I struggle to delegate or let things go.", "PER"),
  it("PER2", "I'm comfortable with 'good enough' and trusting others to deliver.", "PER", -1),
  it("DUT1", "I avoid rocking the boat and defer to those above me.", "DUT"),
  it("DUT2", "I'll push back on authority when I genuinely disagree.", "DUT", -1),
];

export const derailers: Instrument = {
  id: "career-derailers",
  name: "Career Derailers",
  shortName: "Derailers",
  kind: "dimensional",
  category: "career",
  tagline: "The strengths that quietly sabotage you under pressure.",
  description:
    "Most career setbacks aren't caused by missing skills — they come from strengths overused. The 'derailer' tradition " +
    "(pioneered by the Hogan Development Survey) maps the tendencies that serve you most days but undermine you under " +
    "stress: volatility, suspicion, caution, over-confidence, rule-bending, perfectionism, and over-deference. Knowing " +
    "yours is how you keep them from steering at the worst moments.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, inspired by the Hogan Development Survey's derailer model; not affiliated with Hogan Assessment Systems.",
  scales: [
    { id: "VOL", name: "Volatile", description: "Moodiness and flare-ups under pressure (overused passion).", highDescriptor: "intense and easily set off when stressed", lowDescriptor: "steady and hard to rattle", poles: { low: "Steady", high: "Volatile" }, normMean: 2.6, normSd: 0.82 },
    { id: "SKE", name: "Skeptical", description: "Distrust and cynicism (overused insight).", highDescriptor: "watchful, distrustful, and quick to suspect", lowDescriptor: "trusting and open", poles: { low: "Trusting", high: "Skeptical" }, normMean: 2.7, normSd: 0.78 },
    { id: "CAU", name: "Cautious", description: "Risk-aversion and indecision (overused prudence).", highDescriptor: "hesitant and afraid of mistakes", lowDescriptor: "decisive and willing to act", poles: { low: "Decisive", high: "Cautious" }, normMean: 2.7, normSd: 0.8 },
    { id: "BOL", name: "Bold", description: "Over-confidence and entitlement (overused self-belief).", highDescriptor: "self-assured to the point of overestimating yourself", lowDescriptor: "modest and self-questioning", poles: { low: "Modest", high: "Bold" }, normMean: 2.8, normSd: 0.78 },
    { id: "MIS", name: "Mischievous", description: "Risk-taking and rule-bending (overused charm).", highDescriptor: "limit-testing and rule-bending", lowDescriptor: "careful and rule-abiding", poles: { low: "Careful", high: "Mischievous" }, normMean: 2.6, normSd: 0.78 },
    { id: "PER", name: "Perfectionistic", description: "Over-control and micromanaging (overused diligence).", highDescriptor: "exacting, controlling, and reluctant to delegate", lowDescriptor: "flexible and trusting of others", poles: { low: "Flexible", high: "Perfectionistic" }, normMean: 2.9, normSd: 0.78 },
    { id: "DUT", name: "Dutiful", description: "Over-deference and people-pleasing (overused loyalty).", highDescriptor: "conflict-avoidant and eager to please authority", lowDescriptor: "independent and willing to challenge", poles: { low: "Independent", high: "Dutiful" }, normMean: 2.8, normSd: 0.76 },
  ],
  items,
  caveats: [
    "Derailers are normal — everyone has them, and in moderation each is a genuine strength. The point is awareness, not alarm.",
    "They show up most under stress, fatigue, or boredom; a high score is a cue to watch a tendency, not a flaw in your character.",
    "This is an educational development tool inspired by the HDS, not the proprietary Hogan instrument, and not a clinical measure.",
  ],
  citations: [
    { ref: "Hogan, R., & Hogan, J. (1997). Hogan Development Survey Manual. Hogan Assessment Systems." },
    { ref: "Furnham, A., Trickey, G., & Hyde, G. (2012). Bright aspects to dark side traits. Personality and Individual Differences, 52(8), 908–913." },
  ],
};

import type { Instrument, Item } from "../types";

/**
 * Self-Control (Brief Self-Control Scale).
 *
 * Trait self-control — the capacity to override impulses and persist toward goals —
 * is among the strongest personality predictors of academic, health, financial, and
 * relationship outcomes. Modeled here as two facets: Impulse Control (resisting urges
 * and temptation) and Self-Discipline (follow-through and diligence). Items are
 * ORIGINAL to this platform, grounded in Tangney, Baumeister & Boone (2004).
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Impulse Control (high = resists urges/temptation)
  it("R1", "I'm good at resisting temptation.", "RESTRAINT", 1),
  it("R2", "When I'm tempted by something I shouldn't have, I can usually say no.", "RESTRAINT", 1),
  it("R3", "I keep my impulses well in check.", "RESTRAINT", 1),
  it("R4", "I often act on impulse without thinking it through.", "RESTRAINT", -1),
  it("R5", "I have a hard time breaking bad habits.", "RESTRAINT", -1),
  it("R6", "I do things I later regret because I couldn't stop myself.", "RESTRAINT", -1),
  it("R7", "Pleasure and fun sometimes keep me from getting work done.", "RESTRAINT", -1),
  // Self-Discipline (high = follow-through and diligence)
  it("D1", "I stick with tasks until they're finished.", "DISCIPLINE", 1),
  it("D2", "I keep working toward my goals even when it's tedious.", "DISCIPLINE", 1),
  it("D3", "I'm reliable about my routines and commitments.", "DISCIPLINE", 1),
  it("D4", "I can make myself do things I don't feel like doing.", "DISCIPLINE", 1),
  it("D5", "I often start things but don't finish them.", "DISCIPLINE", -1),
  it("D6", "I put off tasks I find boring or difficult.", "DISCIPLINE", -1),
  it("D7", "I wish I had more self-discipline.", "DISCIPLINE", -1),
];

export const selfControl: Instrument = {
  id: "self-control-bscs",
  name: "Self-Control",
  shortName: "Self-Control",
  kind: "dimensional",
  category: "focused",
  tagline: "Resisting the pull of the moment — and following through on what matters.",
  description:
    "Self-control — the ability to override impulses and stay the course toward your goals — predicts success across " +
    "school, work, health, money, and relationships more reliably than almost any other trait. This profiler splits it " +
    "into two facets: Impulse Control (holding back urges and temptation) and Self-Discipline (follow-through and " +
    "diligence). Crucially, self-control is buildable — it works far more through habits and environment than raw willpower.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Brief Self-Control Scale (Tangney, Baumeister & Boone, 2004).",
  scales: [
    { id: "RESTRAINT", name: "Impulse Control", description: "Resisting urges, temptations, and bad habits.", highDescriptor: "able to hold back urges and resist temptation", lowDescriptor: "more easily pulled by impulse and temptation", poles: { low: "Impulsive", high: "Restrained" }, normMean: 3.2, normSd: 0.75 },
    { id: "DISCIPLINE", name: "Self-Discipline", description: "Following through and persisting at tasks.", highDescriptor: "diligent and reliable at following through", lowDescriptor: "more prone to procrastinate and leave things unfinished", poles: { low: "Lax", high: "Disciplined" }, normMean: 3.2, normSd: 0.75 },
  ],
  items,
  caveats: [
    "Self-control is buildable, and it depends far more on habits, routines, and environment than on white-knuckle willpower — design beats grit.",
    "Very high self-control isn't always better: over-control can crowd out spontaneity, rest, and play. Balance matters.",
    "An educational self-reflection tool, not a clinical measure.",
  ],
  citations: [
    { ref: "Tangney, J. P., Baumeister, R. F., & Boone, A. L. (2004). High self-control predicts good adjustment, less pathology, better grades, and interpersonal success. Journal of Personality, 72(2), 271–324." },
    { ref: "Duckworth, A. L., Gendler, T. S., & Gross, J. J. (2016). Situational strategies for self-control. Perspectives on Psychological Science, 11(1), 35–55.", note: "Self-control works best through situation design, not willpower." },
  ],
};

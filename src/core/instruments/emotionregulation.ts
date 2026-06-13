import type { Instrument, Item } from "../types";

/**
 * Emotion Regulation — Reappraisal vs. Suppression.
 *
 * How you manage feelings shapes wellbeing as much as what you feel. Gross's model
 * contrasts two habitual strategies: cognitive reappraisal (reframing a situation
 * to change its emotional charge — generally adaptive) and expressive suppression
 * (inhibiting the outward signs of emotion — more costly over time). Items are
 * ORIGINAL to this platform, grounded in Gross & John's ERQ (2003).
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("R1", "When I want to feel less upset, I rethink how I'm seeing the situation.", "REAP"),
  it("R2", "I control my feelings by changing the way I think about what's happening.", "REAP"),
  it("R3", "When I want to feel more positive, I deliberately reframe the situation.", "REAP"),
  it("R4", "When stressed, I try to think about it in a way that keeps me calm.", "REAP"),
  it("R5", "I find new angles on a hard situation to shift how it makes me feel.", "REAP"),
  it("R6", "When I want to feel less negative, I change what the event means to me.", "REAP"),
  it("S1", "I keep my emotions to myself rather than show them.", "SUPP"),
  it("S2", "When I feel something strongly, I'm careful not to let it show.", "SUPP"),
  it("S3", "I control my feelings by not expressing them.", "SUPP"),
  it("S4", "Even when upset, I keep a neutral face so others can't tell.", "SUPP"),
];

export const emotionRegulation: Instrument = {
  id: "emotion-regulation-erq",
  name: "Emotion Regulation",
  shortName: "Emotion Reg.",
  kind: "dimensional",
  category: "emotional",
  tagline: "How you steer feelings — by reframing them, or by holding them in.",
  description:
    "Two people can feel the same emotion and fare very differently depending on how they handle it. This profiler maps " +
    "two habitual strategies from James Gross's influential model: cognitive reappraisal (changing how you think about a " +
    "situation to change how it feels) and expressive suppression (hiding the outward signs). Reappraisal tends to serve " +
    "wellbeing; suppression carries hidden costs — but both are skills you can rebalance with practice.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Emotion Regulation Questionnaire (Gross & John, 2003).",
  scales: [
    {
      id: "REAP",
      name: "Cognitive Reappraisal",
      description: "Reframing a situation to change its emotional impact.",
      highDescriptor: "skilled at reframing situations to steer your own feelings",
      lowDescriptor: "less inclined to reframe your way through emotions",
      poles: { low: "Rarely reframes", high: "Reframes readily" },
      normMean: 3.6,
      normSd: 0.8,
    },
    {
      id: "SUPP",
      name: "Expressive Suppression",
      description: "Inhibiting the outward expression of emotion.",
      highDescriptor: "inclined to hold feelings in rather than show them",
      lowDescriptor: "expressive and open with what you feel",
      poles: { low: "Expressive", high: "Holds it in" },
      normMean: 2.9,
      normSd: 0.9,
    },
  ],
  items,
  caveats: [
    "Neither strategy is 'good' or 'bad' in the absolute — context matters. Suppression is sometimes wise (a tense meeting); reappraisal isn't always possible (genuine loss needs feeling, not reframing).",
    "On average, habitual reappraisal links to better wellbeing and relationships, and habitual suppression to more strain — but you can build either skill.",
    "Suppressing emotion is different from regulating it; chronically bottling feelings tends to backfire.",
    "This is an educational self-reflection tool, not a clinical or diagnostic measure.",
  ],
  citations: [
    { ref: "Gross, J. J., & John, O. P. (2003). Individual differences in two emotion regulation processes. Journal of Personality and Social Psychology, 85(2), 348–362." },
    { ref: "Gross, J. J. (2015). Emotion regulation: Current status and future prospects. Psychological Inquiry, 26(1), 1–26." },
  ],
};

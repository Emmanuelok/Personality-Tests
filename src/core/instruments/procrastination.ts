import type { Instrument, Item } from "../types";

/**
 * Procrastination — the tendency to voluntarily delay what matters despite
 * expecting to be worse off for it. One of the most studied self-regulation
 * failures, and a strong (inverse) marker of Conscientiousness. Items are
 * ORIGINAL to this platform, grounded in Steel's work and the Pure
 * Procrastination Scale (Steel, 2010; Steel, 2007 meta-analysis).
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale: "PROC", keyed });

const items: Item[] = [
  it("P1", "I delay tasks until just before the deadline."),
  it("P2", "“I'll do it tomorrow” is a phrase I use a lot."),
  it("P3", "I put off starting things even when I know I shouldn't."),
  it("P4", "I waste time on trivial things when I have something important to do."),
  it("P5", "I often find myself rushing because I left things too late."),
  it("P6", "When I plan to start, I usually start on time.", -1),
  it("P7", "I get tasks done well before they're due.", -1),
  it("P8", "Even unpleasant tasks, I tackle without much delay.", -1),
  it("P9", "I tell myself I'll start soon, and then keep not starting."),
  it("P10", "My delays end up costing me time, money, or stress."),
  it("P11", "I'm good at following through on what I schedule.", -1),
  it("P12", "I keep postponing decisions I could make now."),
];

export const procrastination: Instrument = {
  id: "procrastination-pps",
  name: "Procrastination",
  shortName: "Procrastination",
  kind: "dimensional",
  category: "focused",
  tagline: "How much you delay what matters — and what it costs you.",
  description:
    "Procrastination isn't laziness; it's a breakdown between intention and action, usually driven by how a task makes " +
    "us feel right now. It's among the most reliable predictors of missed goals and added stress — and, encouragingly, " +
    "one of the most changeable with the right tactics. This gives you an honest read on your delay tendency as a " +
    "baseline to work from.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Steel's research and the Pure Procrastination Scale (Steel, 2010).",
  scales: [
    {
      id: "PROC",
      name: "Procrastination",
      description: "The tendency to voluntarily delay intended action despite expecting to be worse off.",
      highDescriptor: "prone to delaying tasks and decisions, often at a cost",
      lowDescriptor: "prompt and reliable at starting and finishing",
      poles: { low: "Prompt", high: "Delaying" },
      normMean: 2.9,
      normSd: 0.8,
    },
  ],
  items,
  caveats: [
    "Procrastination is a habit loop, not a character flaw — it responds to tactics (shrinking the first step, removing friction, kinder self-talk) far better than to guilt.",
    "Occasional, strategic delay can be healthy; this measures the chronic, costly kind.",
    "Chronic procrastination that causes real distress can interact with anxiety, ADHD, or depression — worth talking through with a professional if it's heavy.",
    "This is an educational self-reflection tool, not a clinical measure.",
  ],
  citations: [
    { ref: "Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review. Psychological Bulletin, 133(1), 65–94." },
    { ref: "Steel, P. (2010). Arousal, avoidant and decisional procrastinators: Do they exist? Personality and Individual Differences, 48(8), 926–934." },
  ],
};

import type { Instrument, Item } from "../types";

/**
 * Perfectionism — two faces. Modern models split it into striving for high
 * standards (often adaptive) and corrosive concern over mistakes / fear of
 * falling short (often maladaptive). Measuring them separately matters: the same
 * word, very different outcomes. Items are ORIGINAL to this platform, grounded
 * in Frost et al. (1990) and Stoeber & Otto's (2006) two-factor review.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Standards / striving
  it("S1", "I set very high standards for myself.", "STAND"),
  it("S2", "I'm not satisfied with work unless it's excellent.", "STAND"),
  it("S3", "I aim for the best in almost everything I do.", "STAND"),
  it("S4", "I have a strong drive to keep improving.", "STAND"),
  it("S5", "Doing something well matters a great deal to me.", "STAND"),
  // Concerns / evaluative worry
  it("C1", "I'm haunted by my mistakes long after they happen.", "CONC"),
  it("C2", "If I fall short of perfect, I feel like a failure.", "CONC"),
  it("C3", "I worry a lot about others judging my flaws.", "CONC"),
  it("C4", "Small errors make me doubt my whole effort.", "CONC"),
  it("C5", "I'm rarely satisfied, no matter how well I did.", "CONC"),
  it("C6", "Fear of not being good enough holds me back.", "CONC"),
];

export const perfectionism: Instrument = {
  id: "perfectionism-2f",
  name: "Perfectionism",
  shortName: "Perfectionism",
  kind: "dimensional",
  category: "focused",
  tagline: "High standards that lift you — or fear of failing that weighs you down.",
  description:
    "Perfectionism is two things wearing one name. Striving for high personal standards can fuel mastery and pride; " +
    "but corrosive concern over mistakes — harsh self-judgment, fear of falling short — predicts anxiety, burnout, and " +
    "procrastination. This profiler measures both so you can keep the engine and ease the brake.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Frost et al. (1990) and Stoeber & Otto's (2006) two-factor model of perfectionism.",
  scales: [
    {
      id: "STAND",
      name: "High Standards",
      description: "Striving toward demanding personal standards and excellence.",
      highDescriptor: "driven by demanding standards and a pull toward excellence",
      lowDescriptor: "relaxed about standards, easygoing with 'good enough'",
      poles: { low: "Easygoing", high: "Exacting" },
      normMean: 3.6,
      normSd: 0.78,
    },
    {
      id: "CONC",
      name: "Concern Over Mistakes",
      description: "Self-critical worry about errors and others' judgment.",
      highDescriptor: "self-critical, mistake-averse, and weighed down by fear of falling short",
      lowDescriptor: "forgiving of your own mistakes and unbothered by imperfection",
      poles: { low: "Self-accepting", high: "Self-critical" },
      normMean: 2.9,
      normSd: 0.9,
    },
  ],
  items,
  caveats: [
    "High standards are not the problem — the corrosive part is the harsh self-judgment and fear of mistakes. The healthiest profile pairs high Standards with low Concern.",
    "High Concern Over Mistakes is linked to anxiety, burnout, and procrastination; self-compassion practices reliably ease it.",
    "If self-criticism feels relentless or paralyzing, it's worth talking through with a professional.",
    "This is an educational self-reflection tool, not a clinical measure.",
  ],
  citations: [
    { ref: "Frost, R. O., Marten, P., Lahart, C., & Rosenblate, R. (1990). The dimensions of perfectionism. Cognitive Therapy and Research, 14(5), 449–468." },
    { ref: "Stoeber, J., & Otto, K. (2006). Positive conceptions of perfectionism. Personality and Social Psychology Review, 10(4), 295–319." },
  ],
};

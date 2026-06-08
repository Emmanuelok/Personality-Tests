import type { Instrument, Item } from "../types";

/**
 * Moral Foundations (Haidt & Graham) — the intuitive foundations of moral
 * judgment: Care, Fairness, Loyalty, Authority, and Sanctity. Items are ORIGINAL
 * to this platform. This describes the moral intuitions you weigh most heavily —
 * it is not a measure of how 'good' you are, and there are no wrong answers.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Care / Harm
  it("CARE1", "Whether or not someone suffered is central to how I judge an action.", "CARE"),
  it("CARE2", "Compassion for those who are suffering is one of the most important virtues.", "CARE"),
  it("CARE3", "It's deeply wrong to harm a vulnerable or defenseless creature.", "CARE"),
  // Fairness / Cheating
  it("FAIR1", "Justice and treating people equally is one of my highest priorities.", "FAIR"),
  it("FAIR2", "It bothers me deeply when someone is denied their rights.", "FAIR"),
  it("FAIR3", "People should be rewarded in proportion to what they contribute.", "FAIR"),
  // Loyalty / Betrayal
  it("LOYAL1", "Loyalty to my group, family, or country matters a great deal to me.", "LOYAL"),
  it("LOYAL2", "People should stand by their own community, even at a personal cost.", "LOYAL"),
  it("LOYAL3", "Betraying your group is one of the worst things a person can do.", "LOYAL"),
  // Authority / Subversion
  it("AUTH1", "Respect for legitimate authority and tradition is something I value.", "AUTH"),
  it("AUTH2", "Society works best when people follow rightful leaders and rules.", "AUTH"),
  it("AUTH3", "Children should be taught to respect their elders.", "AUTH"),
  // Sanctity / Degradation
  it("SANCT1", "Some things are sacred and should never be violated.", "SANCT"),
  it("SANCT2", "I care about whether actions are decent and pure versus degrading.", "SANCT"),
  it("SANCT3", "People should maintain certain standards of decency and self-discipline.", "SANCT"),
];

export const moralFoundations: Instrument = {
  id: "moral-foundations",
  name: "Moral Foundations",
  shortName: "Moral Foundations",
  kind: "dimensional",
  category: "strengths",
  tagline: "The intuitions beneath your sense of right and wrong.",
  description:
    "Moral Foundations Theory finds that our moral judgments rest on a handful of intuitive foundations — " +
    "Care, Fairness, Loyalty, Authority, and Sanctity. Which ones you weigh most heavily shapes your values, " +
    "your politics, and where you clash with others. This profiler shows your moral fingerprint — no foundation " +
    "is right or wrong.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Moral Foundations Theory (Haidt & Graham).",
  scales: [
    { id: "CARE", name: "Care / Harm", description: "Sensitivity to suffering and compassion.", highDescriptor: "compassionate and protective of the vulnerable", lowDescriptor: "less driven by harm-avoidance in moral judgments", normMean: 4.0, normSd: 0.6 },
    { id: "FAIR", name: "Fairness / Cheating", description: "Concern with justice, rights, and proportionality.", highDescriptor: "justice-minded and attuned to fairness and rights", lowDescriptor: "less centered on fairness in moral judgments", normMean: 3.9, normSd: 0.6 },
    { id: "LOYAL", name: "Loyalty / Betrayal", description: "Valuing group solidarity and allegiance.", highDescriptor: "loyal, group-minded, and devoted to your people", lowDescriptor: "more individualistic than group-loyal", normMean: 3.2, normSd: 0.75 },
    { id: "AUTH", name: "Authority / Subversion", description: "Respect for legitimate authority and tradition.", highDescriptor: "respectful of order, hierarchy, and tradition", lowDescriptor: "more skeptical of authority and tradition", normMean: 3.1, normSd: 0.78 },
    { id: "SANCT", name: "Sanctity / Degradation", description: "Concern with purity, decency, and the sacred.", highDescriptor: "attuned to sanctity, decency, and the sacred", lowDescriptor: "less moved by purity or sanctity concerns", normMean: 3.0, normSd: 0.82 },
  ],
  items,
  caveats: [
    "This describes the moral intuitions you weigh — not whether you're a good person. Every profile is legitimate.",
    "Care and Fairness are sometimes called 'individualizing' foundations; Loyalty, Authority, and Sanctity, 'binding' ones. Most people use all five to differing degrees.",
    "Useful for understanding values and why people disagree — not a political or character verdict.",
  ],
  citations: [
    { ref: "Haidt, J., & Graham, J. (2007). When morality opposes justice: Conservatives have moral intuitions that liberals may not recognize. Social Justice Research, 20(1), 98–116." },
    { ref: "Graham, J., Haidt, J., Nosek, B. A. (2009). Liberals and conservatives rely on different sets of moral foundations. JPSP, 96(5), 1029–1046." },
    { ref: "Haidt, J. (2012). The Righteous Mind. Pantheon." },
  ],
};

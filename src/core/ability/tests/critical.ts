import type { AbilityItem, AbilityTest } from "../types";

/**
 * Critical Thinking — verbal-logical reasoning in the Watson-Glaser tradition:
 * deduction, inference under uncertainty, spotting assumptions, and naming
 * fallacies. Items are ORIGINAL to this platform; each has a single defensible key.
 */

const q = (id: string, domain: string, prompt: string, options: string[], answer: number, pCorrect: number, explain: string): AbilityItem =>
  ({ id, domain, prompt, options, answer, pCorrect, explain });

const items: AbilityItem[] = [
  // Deduction — what necessarily follows
  q("D1", "deduction", "All managers attended the meeting. Sara is a manager. Which must be true?", ["Sara attended the meeting", "Sara is a senior leader", "Only managers attended", "Sara organized the meeting"], 0, 0.82, "If all managers attended and Sara is one, she attended."),
  q("D2", "deduction", "No reptiles are warm-blooded. All snakes are reptiles. Which follows?", ["No snakes are warm-blooded", "Some snakes are warm-blooded", "All reptiles are snakes", "Snakes are mammals"], 0, 0.75, "Snakes are reptiles, and no reptile is warm-blooded."),
  q("D3", "deduction", "If it rains, the match is canceled. The match was NOT canceled. Therefore:", ["It did not rain", "It rained", "The match was delayed", "Nothing can be concluded"], 0, 0.6, "Modus tollens: no cancellation means the condition (rain) didn't occur."),
  q("D4", "deduction", "Some musicians are teachers. All teachers are patient. Which follows?", ["Some musicians are patient", "All musicians are patient", "No musicians are patient", "All patient people are musicians"], 0, 0.58, "The musicians who are teachers must be patient, so some musicians are patient."),

  // Assumptions — the unstated belief an argument relies on
  q("A1", "assumptions", "\"We should hire more staff to improve customer service.\" This assumes:", ["More staff will actually improve service", "Customers are currently furious", "Service cannot improve any other way", "The CEO approves"], 0, 0.62, "The argument's link from action to goal assumes added staff improves service."),
  q("A2", "assumptions", "\"Ban cars downtown to cut pollution.\" This assumes:", ["Cars are a significant source of downtown pollution", "People will stop driving everywhere", "Downtown currently has no pollution", "Bicycles cause no pollution"], 0, 0.66, "The proposal only works if cars meaningfully cause the pollution in question."),
  q("A3", "assumptions", "\"Read this book and you'll become a better leader.\" This assumes:", ["The book contains genuinely useful leadership lessons", "Leaders never read", "Reading is effortless", "The book is a bestseller"], 0, 0.68, "The claim depends on the book actually teaching useful leadership."),
  q("A4", "assumptions", "\"We must cut prices to beat our rivals.\" This assumes:", ["Lower prices will win customers from rivals", "Rivals charge more than us", "We are currently bankrupt", "Customers care only about price"], 0, 0.6, "The action only achieves the goal if lower prices actually shift customers."),

  // Inference — the best-supported (cautious) conclusion
  q("I1", "inference", "Sales rose every month this year, with the biggest jumps right after each ad campaign. Best supported:", ["The campaigns likely contributed to the growth", "Ads are the only cause of all sales", "Sales will keep rising forever", "The product is the best on the market"], 0, 0.7, "The pattern supports a contributing role, not certainty or sole cause."),
  q("I2", "inference", "Every swan observed in the region so far has been white. Best supported:", ["Swans in the region are probably white", "All swans everywhere are white", "Black swans cannot exist", "The next swan is certainly white"], 0, 0.66, "Observation supports a probabilistic local claim, not a universal certainty."),
  q("I3", "inference", "After a new policy, customer complaints fell 40%. Best supported:", ["The policy may have reduced complaints", "The policy definitely caused the drop", "Complaints will reach zero", "Customers stopped caring"], 0, 0.62, "A drop after a change suggests a possible effect — correlation isn't proof of cause."),
  q("I4", "inference", "Plants by the sunny window grew taller than those in the dark corner. Best supported:", ["Light likely helped the plants grow", "Darkness is lethal to all plants", "Only light affects plant growth", "The corner plants were defective"], 0, 0.72, "The comparison supports light helping — without ruling out other factors."),

  // Fallacy — naming the flaw
  q("F1", "fallacy", "\"Everyone is buying it, so it must be the best.\" The flaw is:", ["Bandwagon — popularity isn't proof of quality", "Circular reasoning", "False dilemma", "Straw man"], 0, 0.68, "Appealing to popularity (bandwagon) doesn't establish quality."),
  q("F2", "fallacy", "\"You can't trust her point — she didn't even go to college.\" The flaw is:", ["Attacking the person instead of the argument (ad hominem)", "Slippery slope", "Hasty generalization", "Begging the question"], 0, 0.7, "It dismisses the claim by attacking the speaker, not the reasoning."),
  q("F3", "fallacy", "\"Either we cut the budget, or the company collapses.\" The flaw is:", ["False dilemma — only two options are presented", "Circular reasoning", "Bandwagon", "Red herring"], 0, 0.64, "It forces a choice between two options when others exist."),
  q("F4", "fallacy", "\"One new hire didn't work out, so new hires never do.\" The flaw is:", ["Hasty generalization from a single case", "Straw man", "Appeal to emotion", "False cause"], 0, 0.66, "A single example can't support a sweeping general rule."),
];

export const critical: AbilityTest = {
  id: "critical-thinking",
  name: "Critical Thinking",
  shortName: "Critical",
  category: "cognition",
  tagline: "Reason it through — deduction, inference, assumptions, and fallacies.",
  description:
    "In the tradition of the Watson-Glaser Critical Thinking Appraisal, this tests the reasoning that separates a sound " +
    "argument from a slick one: drawing valid deductions, inferring cautiously from evidence, surfacing hidden " +
    "assumptions, and naming logical fallacies. It's the skill behind clear thinking under persuasion.",
  estMinutes: 10,
  timeLimitSec: 12 * 60,
  domains: [
    { id: "deduction", name: "Deduction", chc: "Gf — fluid reasoning", description: "Drawing conclusions that must follow from premises." },
    { id: "inference", name: "Inference", chc: "Gf — fluid reasoning", description: "Judging what evidence does and doesn't support." },
    { id: "assumptions", name: "Assumptions", chc: "Gf — fluid reasoning", description: "Surfacing the unstated beliefs an argument relies on." },
    { id: "fallacy", name: "Fallacies", chc: "Gc — verbal reasoning", description: "Recognizing common flaws in reasoning." },
  ],
  items,
  itemProvenance: "Original items written for this platform, modeled on the reasoning facets of the Watson-Glaser Critical Thinking Appraisal.",
  caveats: [
    "This is an EDUCATIONAL estimate, not a clinically or professionally validated reasoning test.",
    "Critical thinking is highly trainable — it improves markedly with deliberate practice and good habits of mind.",
    "Your score is reported as a band and a percentile, never a single precise number.",
    "It samples particular reasoning skills, not your knowledge, wisdom, or worth.",
  ],
  citations: [
    { ref: "Watson, G., & Glaser, E. M. (1980). Watson-Glaser Critical Thinking Appraisal Manual. The Psychological Corporation." },
    { ref: "Ennis, R. H. (1987). A taxonomy of critical thinking dispositions and abilities. In Teaching Thinking Skills." },
  ],
};

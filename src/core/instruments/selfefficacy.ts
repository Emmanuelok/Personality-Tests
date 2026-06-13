import type { Instrument, Item } from "../types";

/**
 * General Self-Efficacy.
 *
 * Self-efficacy — your belief that you can organize and execute the actions
 * needed to handle whatever comes — is one of psychology's most powerful
 * predictors of effort, persistence, and achievement (Bandura). This is a single,
 * well-validated dimension. Items are ORIGINAL to this platform, grounded in
 * Bandura (1997) and the General Self-Efficacy Scale (Schwarzer & Jerusalem, 1995).
 */

const L = { min: 1, max: 4, labels: ["Not at all true", "Hardly true", "Moderately true", "Exactly true"] };
const it = (id: string, text: string): Item => ({ id, text, scale: "GSE", keyed: 1 });

const items: Item[] = [
  it("E1", "I can usually solve difficult problems if I try hard enough."),
  it("E2", "When I run into an obstacle, I can find the means to get what I need."),
  it("E3", "It's easy for me to stick to my aims and see my goals through."),
  it("E4", "I'm confident I could deal efficiently with unexpected events."),
  it("E5", "Thanks to my resourcefulness, I can handle unforeseen situations."),
  it("E6", "I can solve most problems if I invest the necessary effort."),
  it("E7", "I can stay calm facing difficulties because I trust my ability to cope."),
  it("E8", "When a problem arises, I can usually find several ways to tackle it."),
  it("E9", "If I'm in trouble, I can usually think of a way out."),
  it("E10", "Whatever comes my way, I'm usually able to handle it."),
];

export const selfEfficacy: Instrument = {
  id: "self-efficacy-gse",
  name: "Self-Efficacy",
  shortName: "Self-Efficacy",
  kind: "dimensional",
  category: "focused",
  tagline: "Your core belief that you can handle whatever comes.",
  description:
    "Self-efficacy is the confidence that you can mobilize the effort and strategies to meet a challenge — and decades " +
    "of research make it one of the strongest predictors of persistence, resilience, and what people actually achieve. " +
    "This is a clean read on your general sense of agency, and because efficacy is built through mastery experiences, " +
    "it doubles as a baseline you can deliberately grow.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Bandura's self-efficacy theory (1997) and the General Self-Efficacy Scale (Schwarzer & Jerusalem, 1995).",
  scales: [
    {
      id: "GSE",
      name: "General Self-Efficacy",
      description: "Belief in your capacity to handle challenges and reach goals.",
      highDescriptor: "confident, agentic, and unfazed by new challenges",
      lowDescriptor: "prone to doubt your ability to handle what's ahead",
      poles: { low: "Self-doubting", high: "Self-assured" },
      normMean: 2.9,
      normSd: 0.5,
    },
  ],
  items,
  caveats: [
    "Self-efficacy is task- and domain-sensitive — you can feel highly capable in one area and shaky in another; this captures a general tendency.",
    "It's built, not fixed: small mastery experiences, good models, and reframing setbacks all raise it over time.",
    "Very high self-efficacy paired with thin skill can tip into overconfidence — pair belief with honest feedback.",
    "This is an educational self-reflection tool, not a clinical measure.",
  ],
  citations: [
    { ref: "Bandura, A. (1997). Self-Efficacy: The Exercise of Control. W. H. Freeman." },
    { ref: "Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy Scale. In Measures in Health Psychology." },
  ],
};

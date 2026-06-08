import type { Instrument, Item } from "../types";

/**
 * Rosenberg Self-Esteem Scale (RSES).
 *
 * The single most widely used measure of global self-esteem (Rosenberg, 1965).
 * Ten items, unidimensional, decades of validation. Item wording follows the
 * long-public-domain RSES.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("S1", "On the whole, I am satisfied with myself.", "EST"),
  it("S2", "I feel that I have a number of good qualities.", "EST"),
  it("S3", "I am able to do things as well as most other people.", "EST"),
  it("S4", "I feel that I'm a person of worth, at least equal to others.", "EST"),
  it("S5", "I take a positive attitude toward myself.", "EST"),
  it("S6", "At times I think I am no good at all.", "EST", -1),
  it("S7", "I feel I do not have much to be proud of.", "EST", -1),
  it("S8", "I certainly feel useless at times.", "EST", -1),
  it("S9", "I wish I could have more respect for myself.", "EST", -1),
  it("S10", "All in all, I am inclined to feel that I am a failure.", "EST", -1),
];

export const selfEsteem: Instrument = {
  id: "self-esteem-rses",
  name: "Self-Esteem (Rosenberg)",
  shortName: "Self-Esteem",
  kind: "dimensional",
  category: "focused",
  tagline: "Your global sense of self-worth — psychology's most-used self-esteem measure.",
  description:
    "The Rosenberg Self-Esteem Scale is the gold-standard measure of global self-worth — how positively, overall, you " +
    "regard yourself. Ten balanced statements, validated across decades and cultures. Self-esteem isn't fixed: it " +
    "responds to how you treat yourself and what you build, so this doubles as a baseline you can grow from.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Items follow the long-public-domain Rosenberg Self-Esteem Scale.",
  scales: [
    { id: "EST", name: "Global Self-Esteem", description: "Overall sense of personal worth and self-acceptance.", highDescriptor: "self-respecting, secure, and accepting of yourself", lowDescriptor: "self-critical and prone to doubt your worth", poles: { low: "Low self-regard", high: "High self-regard" }, normMean: 3.5, normSd: 0.72 },
  ],
  items,
  caveats: [
    "Self-esteem is malleable — it moves with circumstances, self-talk, and what you accomplish. A low score is a starting point, not a fact about your worth.",
    "Healthy self-esteem is secure, not inflated; very high scores driven by needing to feel superior can be a different story.",
    "This is an educational self-reflection tool, not a clinical measure. Persistent low self-worth is worth talking through with someone you trust or a professional.",
  ],
  citations: [
    { ref: "Rosenberg, M. (1965). Society and the Adolescent Self-Image. Princeton University Press." },
    { ref: "Robins, R. W., Hendin, H. M., & Trzesniewski, K. H. (2001). Measuring global self-esteem. Personality and Social Psychology Bulletin, 27(2), 151–161." },
  ],
};

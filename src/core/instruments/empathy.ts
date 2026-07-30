import type { Instrument, Item } from "../types";

/**
 * Empathy — Interpersonal Reactivity Index (Davis).
 *
 * Empathy isn't one thing. Davis's IRI splits it into four facets: cognitive
 * perspective-taking, warm empathic concern, imaginative fantasy, and self-focused
 * personal distress. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Doesn't describe me", "A little", "Moderately", "Well", "Describes me very well"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Perspective-Taking
  it("PT1", "I try to see things from the other person's point of view before judging.", "PT"),
  it("PT2", "When I'm upset with someone, I try to imagine how things look from their side.", "PT"),
  it("PT3", "I believe most issues have two sides and try to see both.", "PT"),
  // Empathic Concern
  it("EC1", "I often feel warm, tender concern for people less fortunate than me.", "EC"),
  it("EC2", "Other people's misfortunes genuinely move me.", "EC"),
  it("EC3", "I'd describe myself as a fairly soft-hearted person.", "EC"),
  // Fantasy
  it("FS1", "I get deeply absorbed in the feelings of characters in stories or films.", "FS"),
  it("FS2", "I really imagine what characters in a novel are going through.", "FS"),
  it("FS3", "I daydream vividly and picture myself in imagined situations.", "FS"),
  // Personal Distress
  it("PD1", "In emergencies, I feel anxious, tense, and a bit overwhelmed.", "PD"),
  it("PD2", "Being in a charged emotional situation frightens me.", "PD"),
  it("PD3", "When I see someone badly hurt, I tend to go to pieces a little.", "PD"),
];

export const empathy: Instrument = {
  id: "empathy-iri",
  name: "Empathy (IRI)",
  shortName: "Empathy",
  kind: "dimensional",
  category: "focused",
  tagline: "Four sides of empathy — thinking, feeling, imagining, and being overwhelmed.",
  description:
    "Empathy is really several capacities. Davis's Interpersonal Reactivity Index maps four: Perspective-Taking (seeing " +
    "another's view), Empathic Concern (warm care for others), Fantasy (absorption into characters and stories), and " +
    "Personal Distress (your own anxiety at others' suffering). Together they sketch how — and how easily — you feel with people.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Davis's Interpersonal Reactivity Index.",
  scales: [
    { id: "PT", name: "Perspective-Taking", description: "Cognitively adopting another's point of view.", highDescriptor: "quick to see others' viewpoints", lowDescriptor: "more anchored in your own perspective", poles: { low: "Self-anchored", high: "Perspective-taking" }, normMean: 3.5, normSd: 0.72 },
    { id: "EC", name: "Empathic Concern", description: "Warm, other-oriented feelings of compassion.", highDescriptor: "warm, caring, and compassionate", lowDescriptor: "cooler and more detached toward others' feelings", poles: { low: "Detached", high: "Compassionate" }, normMean: 3.7, normSd: 0.7 },
    { id: "FS", name: "Fantasy", description: "Imaginatively entering fictional characters' experiences.", highDescriptor: "imaginatively absorbed into stories and characters", lowDescriptor: "grounded in the literal and real", poles: { low: "Literal", high: "Imaginative" }, normMean: 3.3, normSd: 0.82 },
    { id: "PD", name: "Personal Distress", description: "Self-focused anxiety in response to others' suffering.", highDescriptor: "easily overwhelmed by others' distress", lowDescriptor: "able to stay calm amid others' distress", poles: { low: "Composed", high: "Overwhelmed" }, normMean: 2.8, normSd: 0.78 },
  ],
  items,
  caveats: [
    "More empathy isn't always 'better': high Personal Distress can lead to burnout or avoidance, while Perspective-Taking and Empathic Concern are the facets most linked to helping.",
    "Empathy is partly a skill — perspective-taking in particular can be practiced and grown.",
    "This is an educational self-reflection tool, not a clinical measure.",
  ],
  citations: [
    { ref: "Davis, M. H. (1983). Measuring individual differences in empathy. Journal of Personality and Social Psychology, 44(1), 113–126." },
    { ref: "Davis, M. H. (1980). A multidimensional approach to individual differences in empathy. JSAS Catalog of Selected Documents in Psychology, 10, 85." },
  ],
};

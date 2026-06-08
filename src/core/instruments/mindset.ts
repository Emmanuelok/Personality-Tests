import type { Instrument, Item } from "../types";

/**
 * Mindset — fixed vs. growth (Dweck).
 *
 * Carol Dweck's implicit theories of ability: do you believe core qualities like
 * intelligence are fixed, or developable through effort and learning? A growth
 * mindset predicts resilience and achievement. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("M1", "People can substantially change how intelligent they are.", "MIND"),
  it("M2", "No matter who you are, you can significantly improve your abilities.", "MIND"),
  it("M3", "Talent is only a starting point; effort and learning grow it.", "MIND"),
  it("M4", "I can change even basic things about the kind of person I am.", "MIND"),
  it("M5", "Your intelligence is something very basic that you can't change much.", "MIND", -1),
  it("M6", "People have a certain amount of talent and can't do much to change it.", "MIND", -1),
  it("M7", "You're either good at something or you're not.", "MIND", -1),
  it("M8", "People can't really change their core character.", "MIND", -1),
];

export const mindset: Instrument = {
  id: "mindset-dweck",
  name: "Mindset (Fixed ↔ Growth)",
  shortName: "Mindset",
  kind: "dimensional",
  category: "focused",
  tagline: "Do you believe your abilities are carved in stone — or grown?",
  description:
    "Carol Dweck's research on 'mindset' asks a deceptively simple question: do you believe core qualities like " +
    "intelligence and talent are fixed, or that they can grow with effort, strategy, and help? A growth mindset is " +
    "linked to resilience after failure and a love of challenge. This snapshot shows where you lean — and mindset itself " +
    "is one of the most changeable things about you.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Dweck's implicit theories of ability.",
  scales: [
    { id: "MIND", name: "Growth Mindset", description: "Belief that abilities and qualities can be developed.", highDescriptor: "you see ability as grown through effort and learning", lowDescriptor: "you see ability as largely fixed and innate", poles: { low: "Fixed", high: "Growth" }, normMean: 3.4, normSd: 0.72 },
  ],
  items,
  caveats: [
    "Mindset is contextual — you can hold a growth mindset about one domain (say, music) and a fixed one about another (say, math). It's a tendency, not a label.",
    "A growth mindset isn't 'just praise effort' — it's about strategies, learning, and seeking help, not effort alone.",
    "Effects of mindset are real but modest and debated in size; treat this as a useful reflection, not a magic switch.",
  ],
  citations: [
    { ref: "Dweck, C. S. (2006). Mindset: The New Psychology of Success. Random House." },
    { ref: "Yeager, D. S., & Dweck, C. S. (2020). What can be learned from growth mindset controversies? American Psychologist, 75(9), 1269–1284." },
  ],
};

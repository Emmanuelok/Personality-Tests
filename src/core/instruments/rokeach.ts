import type { Instrument, Item } from "../types";

/**
 * Rokeach Values (terminal vs. instrumental, personal vs. social).
 *
 * Milton Rokeach distinguished terminal values (desired end-states of existence)
 * from instrumental values (preferred modes of conduct), and personal from social
 * aims. This profiler maps that classic four-way structure. Items are ORIGINAL to
 * this platform; Rokeach's original survey used ranking rather than ratings.
 */

const L = { min: 1, max: 5, labels: ["Not important to me", "Slightly", "Moderately", "Very important", "Supremely important"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Terminal — Personal (end-states for the self)
  it("TP1", "A comfortable, pleasurable life for myself is a top priority.", "TERMP"),
  it("TP2", "Inner harmony, happiness, and self-respect guide my choices.", "TERMP"),
  it("TP3", "A sense of personal accomplishment matters deeply to me.", "TERMP"),
  // Terminal — Social (end-states for the world)
  it("TS1", "A world of peace, justice, and equality matters deeply to me.", "TERMS"),
  it("TS2", "I care about the freedom and welfare of all people, not only my own.", "TERMS"),
  it("TS3", "I'd give up personal comfort for the greater social good.", "TERMS"),
  // Instrumental — Moral (modes of conduct toward others)
  it("IM1", "Being honest and ethical matters more to me than winning.", "INSTM"),
  it("IM2", "I value being helpful, forgiving, and kind in how I act.", "INSTM"),
  it("IM3", "I'd rather do the right thing than the advantageous thing.", "INSTM"),
  // Instrumental — Competence (modes of conduct re: capability)
  it("IC1", "I value being capable, logical, and effective above all.", "INSTC"),
  it("IC2", "Ambition and achievement are central to who I want to be.", "INSTC"),
  it("IC3", "I admire competence and intelligence as much as warmth.", "INSTC"),
];

export const rokeach: Instrument = {
  id: "rokeach-values",
  name: "Rokeach Values",
  shortName: "Rokeach",
  kind: "dimensional",
  category: "strengths",
  tagline: "End-goals vs. ways of acting — the classic four-way map of what you prize.",
  description:
    "Milton Rokeach split human values two ways: terminal values (the end-states we live for) versus instrumental " +
    "values (the ways of behaving we prize), and personal aims versus social ones. The crossing yields four orientations " +
    "— a clarifying complement to Schwartz's circle, showing whether your compass points toward personal or shared ends, " +
    "and toward moral or competence-based conduct.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Rokeach's value taxonomy.",
  scales: [
    { id: "TERMP", name: "Terminal · Personal", description: "Desired end-states for yourself (a good life, inner peace, accomplishment).", highDescriptor: "focused on personal fulfillment and a good life", lowDescriptor: "less oriented to personal end-goals", poles: { low: "Less central", high: "Central" }, normMean: 3.6, normSd: 0.7 },
    { id: "TERMS", name: "Terminal · Social", description: "Desired end-states for the world (peace, equality, freedom).", highDescriptor: "driven by justice and the common good", lowDescriptor: "less oriented to societal end-goals", poles: { low: "Less central", high: "Central" }, normMean: 3.4, normSd: 0.78 },
    { id: "INSTM", name: "Instrumental · Moral", description: "Prized ways of acting toward others (honest, helpful, forgiving).", highDescriptor: "guided by honesty, kindness, and integrity", lowDescriptor: "less guided by moral conduct values", poles: { low: "Less central", high: "Central" }, normMean: 3.8, normSd: 0.65 },
    { id: "INSTC", name: "Instrumental · Competence", description: "Prized ways of acting re: capability (capable, ambitious, logical).", highDescriptor: "guided by competence, ambition, and effectiveness", lowDescriptor: "less guided by competence values", poles: { low: "Less central", high: "Central" }, normMean: 3.5, normSd: 0.7 },
  ],
  items,
  caveats: [
    "Rokeach's original survey asked you to rank values; rating each one separately gives a looser, quicker read.",
    "Most people hold all four orientations — the useful signal is which ones lead, and where two pull against each other.",
    "Values are aspirational and contextual; this is a mirror for reflection, not a verdict on your character.",
  ],
  citations: [
    { ref: "Rokeach, M. (1973). The Nature of Human Values. Free Press." },
    { ref: "Rokeach, M. (1968). Beliefs, Attitudes, and Values. Jossey-Bass." },
  ],
};

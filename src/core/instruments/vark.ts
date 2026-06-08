import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * VARK Learning Preferences (Visual · Aural · Read/Write · Kinesthetic).
 *
 * A hugely popular model of sensory study preferences. IMPORTANT: the "meshing
 * hypothesis" — that matching teaching to a learning style improves outcomes — is
 * NOT supported by evidence (see caveats). Read this as a note on preference, never
 * a limit on how you can learn. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("V1", "I understand best from diagrams, charts, and maps.", "VIS"),
  it("V2", "I picture things in my mind to remember them.", "VIS"),
  it("V3", "I'd rather see a demonstration than hear an explanation.", "VIS"),
  it("V4", "Color-coding and visual layouts help me a lot.", "VIS"),
  it("A1", "I learn best by listening and talking things through.", "AUR"),
  it("A2", "I remember what people say better than what I read.", "AUR"),
  it("A3", "I enjoy lectures, discussions, and podcasts.", "AUR"),
  it("A4", "I often talk to myself or read aloud to understand.", "AUR"),
  it("R1", "I learn best by reading and writing things down.", "RDW"),
  it("R2", "Lists, notes, and written instructions suit me best.", "RDW"),
  it("R3", "I'd rather read a manual than watch a video.", "RDW"),
  it("R4", "Putting things in my own written words cements them.", "RDW"),
  it("K1", "I learn best by doing — hands-on practice.", "KIN"),
  it("K2", "I get restless sitting still and prefer to move while learning.", "KIN"),
  it("K3", "Real examples and physical experience stick with me.", "KIN"),
  it("K4", "I'd rather try something than read or hear about it.", "KIN"),
];

const META: Record<string, { name: string; title: string; desc: string; summary: string }> = {
  VIS: { name: "Visual", title: "The Visualizer", desc: "diagrams, charts, and seeing", summary: "You lean Visual — diagrams, maps, and seeing how things fit help you most. (A preference, not a limit.)" },
  AUR: { name: "Aural", title: "The Listener", desc: "listening and discussion", summary: "You lean Aural — listening, talking, and discussion help you most. (A preference, not a limit.)" },
  RDW: { name: "Read/Write", title: "The Wordsmith", desc: "reading and writing", summary: "You lean Read/Write — text, notes, and writing things out help you most. (A preference, not a limit.)" },
  KIN: { name: "Kinesthetic", title: "The Doer", desc: "hands-on practice", summary: "You lean Kinesthetic — hands-on practice and real examples help you most. (A preference, not a limit.)" },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const arr = ["VIS", "AUR", "RDW", "KIN"].map((id) => ({ id, mean: s[id].mean }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const sep = top.mean - sorted[1].mean;
  const multimodal = sep < 0.4;
  const meta = META[top.id];
  return {
    code: multimodal ? "Multimodal" : meta.name,
    title: multimodal ? "The Multimodal Learner" : meta.title,
    summary: multimodal
      ? "Your preferences are spread fairly evenly — you're multimodal, comfortable taking information in more than one way."
      : meta.summary,
    components: [
      { label: "Lead preference", value: meta.name, detail: meta.desc },
      { label: "Support preference", value: META[sorted[1].id].name, detail: META[sorted[1].id].desc },
      { label: "Order", value: sorted.map((x) => META[x.id].name).join(" › "), detail: "your channels, strongest first" },
      { label: "Pattern", value: multimodal ? "Multimodal blend" : `Clear ${meta.name}`, detail: multimodal ? "no single channel dominates" : "one channel leads" },
    ],
    confidence: Math.max(0.2, Math.min(0.9, 0.45 + sep)),
  };
}

export const vark: Instrument = {
  id: "vark-learning",
  name: "VARK Learning Preferences",
  shortName: "VARK",
  kind: "typological",
  category: "learning",
  tagline: "Visual, Aural, Read/Write, Kinesthetic — your study preferences (with a caveat).",
  description:
    "VARK describes four sensory channels people often prefer when studying — Visual, Aural, Read/Write, and " +
    "Kinesthetic. It's one of the most popular learning models in the world. We include it for that reason, but with " +
    "honesty: the idea that matching lessons to your 'style' improves learning has been tested repeatedly and not held " +
    "up. Treat your result as a preference worth knowing, never a ceiling on how you can learn.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Fleming's VARK model.",
  scales: [
    { id: "VIS", name: "Visual", description: "Learning via images, diagrams, and spatial layout.", highDescriptor: "drawn to diagrams, charts, and seeing", lowDescriptor: "less reliant on visual material", poles: { low: "Less preferred", high: "Preferred" }, normMean: 3.2, normSd: 0.8 },
    { id: "AUR", name: "Aural", description: "Learning via listening and talking.", highDescriptor: "drawn to listening and discussion", lowDescriptor: "less reliant on the spoken word", poles: { low: "Less preferred", high: "Preferred" }, normMean: 3.1, normSd: 0.8 },
    { id: "RDW", name: "Read/Write", description: "Learning via text — reading and writing.", highDescriptor: "drawn to reading and writing", lowDescriptor: "less reliant on text", poles: { low: "Less preferred", high: "Preferred" }, normMean: 3.2, normSd: 0.8 },
    { id: "KIN", name: "Kinesthetic", description: "Learning via doing and physical experience.", highDescriptor: "drawn to hands-on practice", lowDescriptor: "less reliant on physical practice", poles: { low: "Less preferred", high: "Preferred" }, normMean: 3.4, normSd: 0.78 },
  ],
  items,
  resolveType,
  caveats: [
    "The evidence does NOT support 'learning styles': matching instruction to your preferred channel has repeatedly failed to improve learning (Pashler et al., 2008; Willingham et al., 2015).",
    "What does work is matching the method to the material — and using several channels together. Everyone learns better multimodally.",
    "So enjoy this as a note on what you find comfortable, not a limit on what you're capable of. It is not a measure of ability.",
  ],
  citations: [
    { ref: "Fleming, N. D., & Mills, C. (1992). Not another inventory, rather a catalyst for reflection. To Improve the Academy, 11, 137–155." },
    { ref: "Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. Psychological Science in the Public Interest, 9(3), 105–119.", note: "The key critique: the 'meshing' hypothesis lacks support." },
  ],
};

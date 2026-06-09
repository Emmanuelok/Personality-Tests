import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * VARK Learning Preferences (Visual · Aural · Read/Write · Kinesthetic).
 *
 * A hugely popular model of sensory study preferences. IMPORTANT: the "meshing
 * hypothesis" — that matching teaching to a learning style improves outcomes — is
 * NOT supported by evidence (see caveats). Read this as a note on preference, never
 * a limit on how you can learn. Items are ORIGINAL to this platform.
 */

// VARK is natively a multiple-choice instrument: each situational question offers one option
// per channel (Visual · Aural · Read/Write · Kinesthetic) and you pick the one that fits you,
// so the result is which channels you actually reach for — not how strongly you "agree."
const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
const SCALES4 = ["VIS", "AUR", "RDW", "KIN"] as const;
/** Build a single-select question whose four options each vote for one channel. */
const mc = (id: string, primary: string, text: string, opts: [string, string, string, string]): Item => ({
  id,
  text,
  scale: primary,
  keyed: 1,
  options: SCALES4.map((s, i) => ({ text: opts[i], scale: s })),
});

const items: Item[] = [
  mc("Q1", "VIS", "You're learning to use a new app. You'd rather…", ["explore the screens and icons until it clicks", "have someone walk you through it out loud", "read the help guide first", "tap around and figure it out by doing"]),
  mc("Q2", "AUR", "Someone asks how to get to your place. You'd…", ["sketch or send them a little map", "tell them the turns out loud", "write the directions down", "offer to lead the way there"]),
  mc("Q3", "RDW", "To lock in a new person's name, it helps most to…", ["picture their face alongside the name", "say it aloud a few times", "see it written or jot it down", "tie it to a handshake or gesture"]),
  mc("Q4", "KIN", "Picking how to follow a recipe, you prefer one that…", ["shows a photo of each step", "you can follow along to narrated video", "lists clear written instructions", "lets you taste and adjust as you go"]),
  mc("Q5", "VIS", "Studying for something important, you'd most likely…", ["make diagrams, charts, and color-coded notes", "discuss it aloud or replay recordings", "rewrite and reread your notes", "use flashcards, models, or practice problems"]),
  mc("Q6", "AUR", "A new gadget won't work. You'd first…", ["look at the diagrams in the manual", "call support and talk it through", "read the troubleshooting section", "fiddle with it until it works"]),
  mc("Q7", "RDW", "The teachers you learn best from tend to…", ["use slides, diagrams, and visuals", "explain and discuss things aloud", "give handouts and readings", "run demonstrations and hands-on activities"]),
  mc("Q8", "KIN", "To explain a new idea to a friend, you'd…", ["draw it out for them", "talk it through", "write or text them an explanation", "show them with a real example"]),
  mc("Q9", "VIS", "With a free afternoon to learn something, you'd…", ["watch a visual documentary", "listen to a podcast or talk", "read a book or articles", "take a hands-on workshop"]),
  mc("Q10", "AUR", "Remembering a great trip, what comes back first is…", ["what the places looked like", "the sounds and conversations", "what you read or wrote about it", "what you did and how it felt"]),
  mc("Q11", "RDW", "Handed a new board game, you'd rather…", ["study the board and pieces to get it", "have someone explain the rules", "read the rulebook", "start a practice round and learn as you go"]),
  mc("Q12", "KIN", "Preparing a presentation, you do best by…", ["designing strong visual slides", "rehearsing it aloud", "writing out a full script", "practicing on your feet with props"]),
];

const META: Record<string, { name: string; title: string; desc: string; summary: string }> = {
  VIS: { name: "Visual", title: "The Visualizer", desc: "diagrams, charts, and seeing", summary: "You lean Visual — diagrams, maps, and seeing how things fit help you most. (A preference, not a limit.)" },
  AUR: { name: "Aural", title: "The Listener", desc: "listening and discussion", summary: "You lean Aural — listening, talking, and discussion help you most. (A preference, not a limit.)" },
  RDW: { name: "Read/Write", title: "The Wordsmith", desc: "reading and writing", summary: "You lean Read/Write — text, notes, and writing things out help you most. (A preference, not a limit.)" },
  KIN: { name: "Kinesthetic", title: "The Doer", desc: "hands-on practice", summary: "You lean Kinesthetic — hands-on practice and real examples help you most. (A preference, not a limit.)" },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const arr = SCALES4.map((id) => ({ id, n: s[id].normalized }));
  const sorted = [...arr].sort((a, b) => b.n - a.n);
  const top = sorted[0];
  const sep = top.n - sorted[1].n; // percentage-point gap between the top two channels
  const multimodal = sep < 15;
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
    confidence: Math.max(0.2, Math.min(0.9, 0.45 + sep / 100)),
  };
}

export const vark: Instrument = {
  id: "vark-learning",
  name: "VARK Learning Preferences",
  shortName: "VARK",
  kind: "typological",
  format: "choice",
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

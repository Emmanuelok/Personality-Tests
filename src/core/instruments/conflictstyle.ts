import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Conflict Style (Thomas–Kilmann model) — five modes of handling conflict along
 * two axes: assertiveness and cooperativeness. Items are ORIGINAL to this
 * platform. Knowing your default mode (and your backup) is one of the most
 * practical things you can learn for relationships, teams, and negotiation.
 */

const L = { min: 1, max: 5, labels: ["Rarely", "Sometimes", "Often", "Usually", "Almost always"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Competing (assertive, uncooperative)
  it("CMP1", "When we disagree, I push hard to get my position adopted.", "COMPETE"),
  it("CMP2", "I stand firm and argue for what I think is right, even if others resist.", "COMPETE"),
  it("CMP3", "Winning the point matters to me in a conflict.", "COMPETE"),
  it("CMP4", "I'll use my authority or leverage to settle a dispute my way.", "COMPETE"),
  // Collaborating (assertive, cooperative)
  it("COL1", "I try to find a solution that fully satisfies everyone's concerns.", "COLLAB"),
  it("COL2", "I dig into the real issue so we can solve it together, not just paper over it.", "COLLAB"),
  it("COL3", "I share my views openly and invite others to share theirs.", "COLLAB"),
  it("COL4", "I look for creative options that meet both sides' needs.", "COLLAB"),
  // Compromising (middle)
  it("CMR1", "I look for a fair middle ground where we each give a little.", "COMPROMISE"),
  it("CMR2", "I'd rather split the difference than fight it out.", "COMPROMISE"),
  it("CMR3", "I aim for a workable deal even if no one gets everything.", "COMPROMISE"),
  it("CMR4", "I trade concessions to reach a quick resolution.", "COMPROMISE"),
  // Avoiding (unassertive, uncooperative)
  it("AVD1", "When conflict heats up, I tend to step back or postpone it.", "AVOID"),
  it("AVD2", "I'd often rather sidestep a disagreement than engage it.", "AVOID"),
  it("AVD3", "I stay out of arguments that don't directly concern me.", "AVOID"),
  it("AVD4", "I let things cool down rather than confront them head-on.", "AVOID"),
  // Accommodating (unassertive, cooperative)
  it("ACC1", "I often give in to keep the relationship harmonious.", "ACCOMM"),
  it("ACC2", "I put others' needs ahead of my own to avoid friction.", "ACCOMM"),
  it("ACC3", "I'd rather yield than risk upsetting someone.", "ACCOMM"),
  it("ACC4", "Keeping the peace matters more to me than getting my way.", "ACCOMM"),
];

const META: Record<string, { name: string; title: string; desc: string; summary: string }> = {
  COMPETE: { name: "Competing", title: "The Director", desc: "assertive and goal-driven", summary: "You go after what you believe is right — decisive and willing to stand your ground. Great in a crisis; watch that you don't win battles and lose relationships." },
  COLLAB: { name: "Collaborating", title: "The Problem-Solver", desc: "assertive and cooperative", summary: "You work to satisfy everyone's real needs and solve the underlying issue. The richest mode — just mind that not every conflict is worth the time it takes." },
  COMPROMISE: { name: "Compromising", title: "The Dealmaker", desc: "balanced give-and-take", summary: "You find fair middle ground fast. Pragmatic and efficient; just make sure you're not settling when a fuller solution was available." },
  AVOID: { name: "Avoiding", title: "The Sidestepper", desc: "low-key and conflict-averse", summary: "You sidestep or defer conflict to keep things calm. Useful for trivial or heated moments; costly when real issues go unaddressed." },
  ACCOMM: { name: "Accommodating", title: "The Harmonizer", desc: "giving and harmony-seeking", summary: "You yield to preserve the relationship. Generous and gracious; watch that chronic giving-in doesn't bury your own needs." },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const ids = ["COMPETE", "COLLAB", "COMPROMISE", "AVOID", "ACCOMM"];
  const sorted = ids.map((id) => ({ id, mean: s[id].mean })).sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const second = sorted[1];
  const meta = META[top.id];
  return {
    code: meta.name,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: "Primary style", value: meta.name, detail: meta.desc },
      { label: "Backup style", value: META[second.id].name, detail: META[second.id].desc },
      { label: "Full order", value: sorted.map((x) => META[x.id].name).join(" › ") },
      { label: "Grow", value: "The mode you use least is often the one worth practicing for hard situations." },
    ],
    confidence: Math.max(0.2, Math.min(0.98, 0.5 + (top.mean - second.mean))),
    secondary: META[second.id].name,
  };
}

export const conflictStyle: Instrument = {
  id: "conflict-style",
  name: "Conflict Style (Thomas–Kilmann)",
  shortName: "Conflict Style",
  kind: "typological",
  category: "relationships",
  tagline: "How you handle disagreement — your default mode, and your backup.",
  description:
    "The Thomas–Kilmann model maps five ways of handling conflict along two axes — how assertive you are and " +
    "how cooperative. There's no 'best' mode; the skill is using the right one for the situation. This profiler " +
    "finds your default and backup styles, and points to the mode worth practicing.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Thomas–Kilmann conflict-mode model.",
  scales: [
    { id: "COMPETE", name: "Competing", description: "Assertive, uncooperative — pursuing your own concerns.", highDescriptor: "assertive, direct, and willing to stand firm", lowDescriptor: "rarely forceful in conflict", poles: { low: "Yielding", high: "Forceful" }, normMean: 3.0, normSd: 0.72 },
    { id: "COLLAB", name: "Collaborating", description: "Assertive and cooperative — solving for everyone.", highDescriptor: "engaged, open, and solution-seeking", lowDescriptor: "less inclined to dig into shared solutions", poles: { low: "Surface", high: "Problem-solving" }, normMean: 3.5, normSd: 0.68 },
    { id: "COMPROMISE", name: "Compromising", description: "Moderate give-and-take.", highDescriptor: "pragmatic and fairness-seeking", lowDescriptor: "less inclined to split the difference", poles: { low: "All-or-nothing", high: "Middle-ground" }, normMean: 3.4, normSd: 0.66 },
    { id: "AVOID", name: "Avoiding", description: "Unassertive, uncooperative — sidestepping.", highDescriptor: "calm, conflict-averse, and de-escalating", lowDescriptor: "inclined to engage rather than withdraw", poles: { low: "Confronting", high: "Withdrawing" }, normMean: 3.1, normSd: 0.7 },
    { id: "ACCOMM", name: "Accommodating", description: "Unassertive, cooperative — yielding for harmony.", highDescriptor: "generous, harmony-seeking, and self-sacrificing", lowDescriptor: "less inclined to yield for peace", poles: { low: "Self-asserting", high: "Yielding" }, normMean: 3.2, normSd: 0.7 },
  ],
  items,
  resolveType,
  caveats: [
    "No style is best — flexibility across all five is the real goal.",
    "Your style can differ at work vs. home; answer for the setting most on your mind.",
    "A practical model for communication, not a clinical test.",
  ],
  citations: [
    { ref: "Thomas, K. W., & Kilmann, R. H. (1974). Thomas-Kilmann Conflict Mode Instrument. Xicom.", note: "Origin of the five-mode model (instrument not used here)." },
    { ref: "Rahim, M. A. (1983). A measure of styles of handling interpersonal conflict. Academy of Management Journal, 26(2), 368–376." },
  ],
};

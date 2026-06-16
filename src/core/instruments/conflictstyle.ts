import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { conflictTypeStrings, type ConflictTypeBundle } from "./i18n";

/**
 * Conflict Style (Thomas–Kilmann model) — five modes of handling conflict along
 * two axes: assertiveness and cooperativeness. Items are ORIGINAL to this
 * platform. Knowing your default mode (and your backup) is one of the most
 * practical things you can learn for relationships, teams, and negotiation.
 */

// The Thomas–Kilmann model is natively forced/multiple-choice: in a given conflict you can
// only do one thing, so each scenario offers one option per mode and you pick what you'd
// actually do — surfacing your default and backup, not five separate frequency ratings.
const L = { min: 1, max: 5, labels: ["Rarely", "Sometimes", "Often", "Usually", "Almost always"] };
const MODES5 = ["COMPETE", "COLLAB", "COMPROMISE", "AVOID", "ACCOMM"] as const;
/** Build a single-select conflict scenario whose five options each vote for one mode. */
const mc = (id: string, primary: string, text: string, opts: [string, string, string, string, string]): Item => ({
  id,
  text,
  scale: primary,
  keyed: 1,
  options: MODES5.map((s, i) => ({ text: opts[i], scale: s })),
});

const items: Item[] = [
  mc("CS1", "COMPETE", "A colleague pushes a plan you think is wrong. You're most likely to…", ["make your case firmly and push for your approach", "dig into the real issue together to find the best answer", "look for a middle ground you can both live with", "let it go for now and revisit later if it matters", "go along with their plan to keep things smooth"]),
  mc("CS2", "COLLAB", "Tension is rising in a disagreement. Your instinct is to…", ["hold your ground and keep arguing your point", "slow down and work through what's really going on", "propose a quick, fair split so you can both move on", "step back and let things cool down", "yield to keep the peace"]),
  mc("CS3", "COMPROMISE", "You and a friend want different things for a shared plan. You…", ["advocate hard for what you want", "look for an option that gives you both what matters most", "each give a little and meet in the middle", "go with the flow and avoid making it a thing", "defer to what they'd prefer"]),
  mc("CS4", "AVOID", "Someone challenges you in a meeting. You tend to…", ["push back and defend your position", "invite their view and build toward a solution", "find a compromise that satisfies enough of both", "deflect and move the discussion along", "concede to avoid friction"]),
  mc("CS5", "ACCOMM", "When a conflict just isn't resolving, you're most likely to…", ["press until it's settled your way", "keep working it until everyone's needs are met", "broker a deal where everyone gives something", "table it and step away for now", "give in so it's over"]),
  mc("CS6", "COMPETE", "Your top priority in most disagreements is to…", ["get the right outcome, as you see it", "solve the underlying problem fully", "reach a fair, workable resolution fast", "keep things calm and low-drama", "protect the relationship and harmony"]),
  mc("CS7", "COLLAB", "A family member wants something you don't. You usually…", ["stand firm on what you need", "talk it all the way through to a real solution", "find a halfway point", "let it slide to avoid a row", "give them their way to keep the peace"]),
  mc("CS8", "COMPROMISE", "Under pressure in a dispute, your default is to be…", ["decisive and forceful", "open and solution-focused", "practical and even-handed", "low-key and disengaging", "gracious and yielding"]),
  mc("CS9", "AVOID", "Looking back at conflicts you've had, you most often…", ["fought for your position", "worked toward a win-win", "split the difference", "stepped away from it", "let the other person have their way"]),
  mc("CS10", "ACCOMM", "The trap you're most prone to in conflict is…", ["winning the point but straining the relationship", "over-investing time in small disputes", "settling for less than was possible", "leaving real issues unaddressed", "burying your own needs"]),
];

/** Canonical, language-agnostic mode codes (the English mode names). */
const CODE_EN: Record<string, string> = { COMPETE: "Competing", COLLAB: "Collaborating", COMPROMISE: "Compromising", AVOID: "Avoiding", ACCOMM: "Accommodating" };

/** English default; es/fr live in core/instruments/i18n.ts (conflictTypeStrings). */
const CONFLICT_TYPE_EN: ConflictTypeBundle = {
  meta: {
    COMPETE: { name: "Competing", title: "The Director", desc: "assertive and goal-driven", summary: "You go after what you believe is right — decisive and willing to stand your ground. Great in a crisis; watch that you don't win battles and lose relationships." },
    COLLAB: { name: "Collaborating", title: "The Problem-Solver", desc: "assertive and cooperative", summary: "You work to satisfy everyone's real needs and solve the underlying issue. The richest mode — just mind that not every conflict is worth the time it takes." },
    COMPROMISE: { name: "Compromising", title: "The Dealmaker", desc: "balanced give-and-take", summary: "You find fair middle ground fast. Pragmatic and efficient; just make sure you're not settling when a fuller solution was available." },
    AVOID: { name: "Avoiding", title: "The Sidestepper", desc: "low-key and conflict-averse", summary: "You sidestep or defer conflict to keep things calm. Useful for trivial or heated moments; costly when real issues go unaddressed." },
    ACCOMM: { name: "Accommodating", title: "The Harmonizer", desc: "giving and harmony-seeking", summary: "You yield to preserve the relationship. Generous and gracious; watch that chronic giving-in doesn't bury your own needs." },
  },
  labels: { primary: "Primary style", backup: "Backup style", order: "Full order", grow: "Grow" },
  growTip: "The mode you use least is often the one worth practicing for hard situations.",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = conflictTypeStrings(locale) ?? CONFLICT_TYPE_EN;
  const sorted = MODES5.map((id) => ({ id, n: s[id].normalized })).sort((a, b) => b.n - a.n);
  const top = sorted[0];
  const second = sorted[1];
  const meta = T.meta[top.id];
  return {
    code: CODE_EN[top.id],
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.primary, value: meta.name, detail: meta.desc },
      { label: T.labels.backup, value: T.meta[second.id].name, detail: T.meta[second.id].desc },
      { label: T.labels.order, value: sorted.map((x) => T.meta[x.id].name).join(" › ") },
      { label: T.labels.grow, value: T.growTip },
    ],
    confidence: Math.max(0.2, Math.min(0.98, 0.5 + (top.n - second.n) / 100)),
    secondary: T.meta[second.id].name,
  };
}

export const conflictStyle: Instrument = {
  id: "conflict-style",
  name: "Conflict Style (Thomas–Kilmann)",
  shortName: "Conflict Style",
  kind: "typological",
  format: "choice",
  category: "communication",
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

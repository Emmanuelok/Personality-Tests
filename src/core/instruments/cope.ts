import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Coping Styles (Brief-COPE tradition) — how you tend to handle stress, grouped
 * into four higher-order styles. Resolves your dominant style. Original items
 * inspired by Carver's Brief-COPE.
 */

const L = { min: 1, max: 5, labels: ["I don't do this", "A little", "Sometimes", "Often", "I do this a lot"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("P1", "I take active steps to fix the problem.", "PROB"),
  it("P2", "I make a plan of action and work through it.", "PROB"),
  it("P3", "I focus my energy on what I can actually do about it.", "PROB"),
  it("P4", "I concentrate hard on solving it.", "PROB"),
  it("E1", "I try to see the situation in a more positive light.", "EMO"),
  it("E2", "I accept the reality of what has happened.", "EMO"),
  it("E3", "I look for meaning or growth in the experience.", "EMO"),
  it("E4", "I remind myself that things could be worse.", "EMO"),
  it("S1", "I reach out to others for emotional comfort.", "SUP"),
  it("S2", "I ask people for advice or practical help.", "SUP"),
  it("S3", "I talk to someone about how I'm feeling.", "SUP"),
  it("S4", "I lean on friends or family to get through.", "SUP"),
  it("A1", "I distract myself so I don't have to think about it.", "AVO"),
  it("A2", "I tell myself it isn't really happening.", "AVO"),
  it("A3", "I give up trying to deal with it.", "AVO"),
  it("A4", "I use food, drink, or other escapes to feel better.", "AVO"),
];

const META: Record<string, { name: string; title: string; desc: string; summary: string }> = {
  PROB: { name: "Problem-Focused", title: "The Problem-Solver", desc: "active coping, planning", summary: "Your go-to style is problem-focused — you meet stress head-on, making plans and changing what you can. Powerful when a situation is controllable; tiring when it isn't." },
  EMO: { name: "Emotion-Focused", title: "The Reframer", desc: "reframing, acceptance, meaning", summary: "Your go-to style is emotion-focused — you manage the inner weather through reframing, acceptance, and meaning. Invaluable for what can't be changed; risky if it becomes avoidance of action." },
  SUP: { name: "Support-Seeking", title: "The Connector", desc: "emotional & practical support", summary: "Your go-to style is seeking support — you turn to others for comfort and advice. A genuine strength, as long as it complements (not replaces) acting on the problem." },
  AVO: { name: "Avoidant", title: "The Avoider", desc: "distraction, denial, escape", summary: "Your go-to style leans avoidant — distraction, denial, or escape. It can buy short-term relief, but as a habit it tends to prolong stress. Worth gently shifting toward the other three." },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const arr = ["PROB", "EMO", "SUP", "AVO"].map((id) => ({ id, mean: s[id].mean }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const sep = top.mean - sorted[1].mean;
  const meta = META[top.id];
  return {
    code: meta.name,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: "Dominant style", value: meta.name, detail: meta.desc },
      { label: "Secondary style", value: META[sorted[1].id].name, detail: META[sorted[1].id].desc },
      { label: "Full order", value: sorted.map((x) => META[x.id].name).join(" › ") },
      { label: "Flexibility", value: sep < 0.4 ? "a balanced repertoire" : "one clear go-to", detail: "drawing on several styles is itself a strength" },
    ],
    confidence: Math.max(0.2, Math.min(0.95, 0.5 + sep)),
    secondary: META[sorted[1].id].name,
  };
}

export const cope: Instrument = {
  id: "coping-styles",
  name: "Coping Styles",
  shortName: "Coping",
  kind: "typological",
  category: "wellbeing",
  tagline: "How you handle stress — problem-solving, reframing, reaching out, or avoiding.",
  description:
    "When stress hits, people reach for different tools. Building on Carver's Brief-COPE, this profiler groups coping " +
    "into four styles — Problem-Focused, Emotion-Focused, Support-Seeking, and Avoidant — and names your go-to. The " +
    "healthiest coping isn't one style but flexibility: matching the tool to whether a situation can be changed.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, inspired by Carver's Brief-COPE.",
  scales: [
    { id: "PROB", name: "Problem-Focused", description: "Acting directly to change the stressor.", highDescriptor: "active, planful, and solution-driven", lowDescriptor: "less inclined to tackle stressors head-on", poles: { low: "Less used", high: "Signature" }, normMean: 3.5, normSd: 0.72 },
    { id: "EMO", name: "Emotion-Focused", description: "Managing the feelings through reframing and acceptance.", highDescriptor: "reframing, accepting, and meaning-making", lowDescriptor: "less inclined to work on your inner response", poles: { low: "Less used", high: "Signature" }, normMean: 3.4, normSd: 0.72 },
    { id: "SUP", name: "Support-Seeking", description: "Turning to others for comfort and help.", highDescriptor: "reaching out for support and advice", lowDescriptor: "more likely to cope solo", poles: { low: "Less used", high: "Signature" }, normMean: 3.2, normSd: 0.8 },
    { id: "AVO", name: "Avoidant", description: "Distraction, denial, and escape.", highDescriptor: "leaning on distraction and escape", lowDescriptor: "rarely avoiding or escaping stressors", poles: { low: "Rarely", high: "Often" }, normMean: 2.4, normSd: 0.78 },
  ],
  items,
  resolveType,
  caveats: [
    "No style is simply 'good' or 'bad' — the skill is flexibility: problem-focused coping fits controllable situations, emotion-focused fits uncontrollable ones.",
    "Even avoidant coping has a place briefly; the concern is relying on it as your main strategy.",
    "An educational self-reflection, not a clinical measure.",
  ],
  citations: [
    { ref: "Carver, C. S. (1997). You want to measure coping but your protocol's too long: Consider the Brief COPE. International Journal of Behavioral Medicine, 4(1), 92–100." },
    { ref: "Lazarus, R. S., & Folkman, S. (1984). Stress, Appraisal, and Coping. Springer." },
  ],
};

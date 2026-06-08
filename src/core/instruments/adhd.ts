import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * ADHD Traits — an EDUCATIONAL self-screen for traits associated with attention
 * and hyperactivity, across two facets (inattention, hyperactivity/impulsivity).
 * Items are ORIGINAL to this platform, informed by the ASRS framework. This is a
 * reflection tool, NOT a diagnosis — only a qualified clinician can diagnose ADHD.
 */

const L = { min: 1, max: 5, labels: ["Never", "Rarely", "Sometimes", "Often", "Very often"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Inattention
  it("IN1", "I have trouble sustaining attention on tasks or reading.", "INATT"),
  it("IN2", "I'm easily distracted by things around me or by my own thoughts.", "INATT"),
  it("IN3", "I lose things or forget appointments and everyday details.", "INATT"),
  it("IN4", "I put off and struggle to start or finish tasks that bore me.", "INATT"),
  it("IN5", "My mind wanders, even in the middle of a conversation.", "INATT"),
  it("IN6", "I find it hard to organize tasks and manage my time.", "INATT"),
  // Hyperactivity / Impulsivity
  it("HY1", "I feel restless and find it hard to sit still for long.", "HYP"),
  it("HY2", "I act or speak on impulse before thinking it through.", "HYP"),
  it("HY3", "I interrupt people or finish their sentences.", "HYP"),
  it("HY4", "I find it hard to wait my turn or be patient.", "HYP"),
  it("HY5", "I'm often 'on the go,' as if driven by a motor.", "HYP"),
  it("HY6", "I make quick decisions I sometimes regret.", "HYP"),
];

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const overall = Math.round((s.INATT.normalized + s.HYP.normalized) / 2);
  const lvl = (n: number) => (n >= 66 ? "elevated" : n >= 40 ? "moderate" : "low");
  let code: string;
  let title: string;
  if (overall >= 66) {
    code = "Many traits";
    title = "Many ADHD-associated traits";
  } else if (overall >= 40) {
    code = "Some traits";
    title = "Some ADHD-associated traits";
  } else {
    code = "Few traits";
    title = "Few ADHD-associated traits";
  }
  return {
    code,
    title,
    summary:
      `This is an educational self-screen, not a diagnosis. You reported a ${lvl(overall)} level of traits associated with ADHD. ` +
      (overall >= 66
        ? "If these traits significantly affect your work, relationships, or wellbeing, consider talking to a qualified clinician for a proper evaluation."
        : "Many people have some of these traits; they only matter clinically when they're persistent and impairing."),
    components: [
      { label: "Inattention", value: lvl(s.INATT.normalized), detail: `${Math.round(s.INATT.normalized)}/100` },
      { label: "Hyperactivity / impulsivity", value: lvl(s.HYP.normalized), detail: `${Math.round(s.HYP.normalized)}/100` },
      { label: "Overall trait level", value: `${overall}/100`, detail: title },
      { label: "Important", value: "Only a licensed professional can diagnose ADHD. This screen can't." },
    ],
    confidence: 0.6,
  };
}

export const adhd: Instrument = {
  id: "adhd-traits",
  name: "ADHD Traits (educational screen)",
  shortName: "ADHD Traits",
  kind: "typological",
  category: "mind",
  tagline: "Reflect on attention & hyperactivity traits — insight, not a diagnosis.",
  description:
    "An educational self-reflection screen for traits associated with ADHD — across inattention and " +
    "hyperactivity/impulsivity. It can help you understand your patterns and decide whether to seek a proper " +
    "assessment. It is NOT a diagnostic tool: only a qualified clinician can diagnose ADHD.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, informed by the Adult ADHD Self-Report Scale (ASRS) framework. Educational use only.",
  scales: [
    { id: "INATT", name: "Inattention", description: "Trouble with focus, organization, memory, and follow-through.", highDescriptor: "frequently distracted, disorganized, and prone to losing focus", lowDescriptor: "generally focused and organized", poles: { low: "Focused", high: "Distractible" }, normMean: 2.9, normSd: 0.85 },
    { id: "HYP", name: "Hyperactivity / Impulsivity", description: "Restlessness, impulsivity, and impatience.", highDescriptor: "restless, impulsive, and quick to act", lowDescriptor: "generally calm and deliberate", poles: { low: "Calm", high: "Restless" }, normMean: 2.7, normSd: 0.82 },
  ],
  items,
  resolveType,
  caveats: [
    "This is NOT a diagnosis. Only a qualified clinician can diagnose ADHD, using a full clinical picture.",
    "Many traits here overlap with stress, anxiety, sleep deprivation, and ordinary variation — context matters.",
    "If these traits are persistent and getting in the way of your life, that's worth raising with a professional.",
  ],
  citations: [
    { ref: "Kessler, R. C., et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychological Medicine, 35(2), 245–256." },
    { ref: "American Psychiatric Association (2013). Diagnostic and Statistical Manual of Mental Disorders (DSM-5)." },
  ],
};

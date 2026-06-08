import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Leadership Styles (Full-Range Leadership / MLQ tradition).
 *
 * Bass & Avolio's Full-Range Leadership model spans transformational leadership
 * (inspiring, developing), transactional leadership (exchange and oversight), and
 * passive/laissez-faire leadership (hands-off). Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Never / rarely", "Occasionally", "Sometimes", "Fairly often", "Almost always"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("TF1", "I inspire others with a compelling vision of what's possible.", "TFM"),
  it("TF2", "I coach and develop each person's individual potential.", "TFM"),
  it("TF3", "I get people to look beyond self-interest for the good of the group.", "TFM"),
  it("TF4", "I encourage others to question assumptions and think in new ways.", "TFM"),
  it("TS1", "I set clear expectations and reward people for meeting them.", "TRN"),
  it("TS2", "I track performance against targets and step in to correct deviations.", "TRN"),
  it("TS3", "I make the exchange explicit: do the work, get the reward.", "TRN"),
  it("TS4", "I focus on rules, standards, and keeping things on track.", "TRN"),
  it("LF1", "I tend to stay out of the way and let things run themselves.", "LFR"),
  it("LF2", "I avoid getting involved until problems become serious.", "LFR"),
  it("LF3", "I delay decisions and let others sort things out.", "LFR"),
  it("LF4", "I'm often absent when I'm needed to lead.", "LFR"),
];

const META: Record<string, { name: string; title: string; desc: string; summary: string }> = {
  TFM: { name: "Transformational", title: "The Visionary", desc: "inspire, develop, elevate", summary: "Your dominant style is transformational — you lead by inspiring a shared vision, developing people, and lifting them beyond self-interest. The most consistently effective style, when paired with follow-through." },
  TRN: { name: "Transactional", title: "The Manager", desc: "clarity, exchange, oversight", summary: "Your dominant style is transactional — you lead by setting clear expectations, rewarding results, and managing performance. Reliable and fair; most powerful when topped up with vision." },
  LFR: { name: "Laissez-Faire", title: "The Hands-Off Lead", desc: "avoidant, absent oversight", summary: "Your dominant style is passive/laissez-faire — you tend to stay out of the way. Sometimes that's healthy delegation; often it leaves a leadership vacuum. This is the style research links to the weakest outcomes." },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const arr = Object.keys(META).map((id) => ({ id, mean: s[id].mean }));
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
      { label: "Full range", value: sorted.map((x) => META[x.id].name).join(" › ") },
      { label: "Profile", value: sep >= 0.5 ? "one style leads" : "a blend of styles", detail: "the best leaders flex transformational + transactional" },
    ],
    confidence: Math.max(0.2, Math.min(0.95, 0.5 + sep)),
    secondary: META[sorted[1].id].name,
  };
}

export const leadership: Instrument = {
  id: "leadership-styles",
  name: "Leadership Styles",
  shortName: "Leadership",
  kind: "typological",
  category: "career",
  tagline: "Transformational, transactional, or hands-off — how you lead.",
  description:
    "The Full-Range Leadership model (behind the widely-used Multifactor Leadership Questionnaire) maps how you lead " +
    "across three modes: transformational (inspiring and developing people), transactional (clear exchange and " +
    "oversight), and passive/laissez-faire (hands-off). The strongest leaders are mostly transformational, backed by " +
    "solid transactional habits — and low on the passive style.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Bass & Avolio's Full-Range Leadership model.",
  scales: [
    { id: "TFM", name: "Transformational", description: "Inspiring vision, individualized development, intellectual stimulation.", highDescriptor: "inspiring, developmental, and vision-driven", lowDescriptor: "less focused on vision and development", poles: { low: "Less used", high: "Signature" }, normMean: 3.4, normSd: 0.74 },
    { id: "TRN", name: "Transactional", description: "Contingent reward and active management.", highDescriptor: "clear, structured, and performance-managing", lowDescriptor: "less focused on targets and oversight", poles: { low: "Less used", high: "Signature" }, normMean: 3.3, normSd: 0.72 },
    { id: "LFR", name: "Laissez-Faire", description: "Passive, avoidant, hands-off leadership.", highDescriptor: "hands-off and slow to engage", lowDescriptor: "present, engaged, and responsive", poles: { low: "Engaged", high: "Hands-off" }, normMean: 2.3, normSd: 0.74 },
  ],
  items,
  resolveType,
  caveats: [
    "This rates your self-perceived style; real leadership 360s gather ratings from those you lead, which often differ — consider asking for that feedback.",
    "Context matters: a crisis, a new team, or a routine operation each call for a different blend.",
    "Laissez-faire isn't always bad (skilled experts may need space), but as a default it's the style most linked to poor outcomes.",
  ],
  citations: [
    { ref: "Bass, B. M., & Avolio, B. J. (1994). Improving Organizational Effectiveness Through Transformational Leadership. Sage." },
    { ref: "Avolio, B. J., & Bass, B. M. (2004). Multifactor Leadership Questionnaire (MLQ), 3rd ed. Mind Garden." },
  ],
};

import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Grit & Resilience (perseverance + consistency).
 *
 * Grit — passion and perseverance for long-term goals — predicts achievement above
 * and beyond talent (Duckworth et al., 2007). It has two facets: Perseverance of
 * Effort and Consistency of Interest. Items are ORIGINAL to this platform; grit is
 * malleable, so this doubles as a roadmap for building follow-through.
 */

const L = { min: 1, max: 5, labels: ["Not like me at all", "A little", "Somewhat", "Mostly like me", "Very much like me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Perseverance of Effort
  it("PE1", "I finish whatever I begin.", "PERS"),
  it("PE2", "Setbacks don't discourage me for long; I bounce back and keep going.", "PERS"),
  it("PE3", "I am a hard worker.", "PERS"),
  it("PE4", "I keep working diligently even when progress is slow.", "PERS"),
  // Consistency of Interest
  it("CI1", "I stay focused on the same goals for years.", "CONS"),
  it("CI2", "My interests stay fairly stable from year to year.", "CONS"),
  it("CI3", "I rarely abandon a project once I've truly committed to it.", "CONS"),
  it("CI4", "New ideas and projects don't easily lure me away from my current ones.", "CONS"),
];

function band(n: number): { code: string; title: string; summary: string } {
  if (n >= 66) return { code: "High Grit", title: "The Finisher", summary: "Strong perseverance and steady focus — you pursue long-term goals with real stamina." };
  if (n >= 42) return { code: "Growing Grit", title: "The Steady Builder", summary: "A solid base of grit, with room to deepen either your perseverance or your long-term focus." };
  return { code: "Emerging Grit", title: "The Explorer", summary: "You favor flexibility and novelty; building follow-through and consistency is your biggest growth lever." };
}

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const pers = s.PERS.normalized;
  const cons = s.CONS.normalized;
  const overall = Math.round((pers + cons) / 2);
  const meta = band(overall);
  const lvl = (n: number) => (n >= 66 ? "high" : n >= 42 ? "moderate" : "developing");
  const confidence = Math.max(0.2, Math.min(0.98, Math.abs(overall - 50) / 50 + 0.45));
  return {
    code: meta.code,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: "Overall grit", value: `${overall}/100`, detail: meta.code },
      { label: "Perseverance of effort", value: lvl(pers), detail: `${Math.round(pers)}/100 — how hard you push and bounce back` },
      { label: "Consistency of interest", value: lvl(cons), detail: `${Math.round(cons)}/100 — how steadily you stick with goals` },
      { label: "Growth lever", value: pers <= cons ? "perseverance" : "consistency", detail: "your lower facet is where gains come fastest" },
    ],
    confidence,
  };
}

export const grit: Instrument = {
  id: "grit-resilience",
  name: "Grit & Resilience",
  shortName: "Grit",
  kind: "typological",
  category: "strengths",
  tagline: "Passion and perseverance for long-term goals — and how to grow it.",
  description:
    "Grit is the combination of perseverance and sustained passion that predicts who reaches long-term goals, " +
    "often more than raw talent. This profiler measures its two facets — Perseverance of Effort and " +
    "Consistency of Interest — and, because grit is malleable, points you to the facet where growth comes fastest.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Duckworth's grit construct.",
  scales: [
    { id: "PERS", name: "Perseverance of Effort", description: "Working hard and bouncing back from setbacks.", highDescriptor: "hard-working, resilient, and able to push through difficulty", lowDescriptor: "more easily slowed by obstacles and fatigue", poles: { low: "Easily slowed", high: "Persevering" }, normMean: 3.6, normSd: 0.65 },
    { id: "CONS", name: "Consistency of Interest", description: "Sticking with the same goals over time.", highDescriptor: "steady and focused on long-term goals", lowDescriptor: "drawn to new interests, with focus that shifts over time", poles: { low: "Shifting", high: "Steady" }, normMean: 3.2, normSd: 0.72 },
  ],
  items,
  resolveType,
  caveats: [
    "Grit is malleable — it grows with practice, purpose, and the right environment. A low score is a starting line, not a ceiling.",
    "Consistency of interest is not the same as never exploring; healthy exploration early can lead to deeper commitment later.",
    "Grit matters most paired with goals worth pursuing — and with rest. It is not about grinding yourself out.",
  ],
  citations: [
    { ref: "Duckworth, A. L., Peterson, C., Matthews, M. D., & Kelly, D. R. (2007). Grit: Perseverance and passion for long-term goals. JPSP, 92(6), 1087–1101." },
    { ref: "Duckworth, A. L. (2016). Grit: The Power of Passion and Perseverance. Scribner." },
  ],
};

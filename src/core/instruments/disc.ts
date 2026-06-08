import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { discTypeStrings, type DiscTypeBundle } from "./i18n";

/**
 * DISC Behavioral Styles (D · I · S · C).
 *
 * A model of observable behavioral tendencies descended from Marston's work and
 * widely used in workplace and team settings. Items are ORIGINAL to this platform.
 * Resolution reports your primary and secondary styles and their blend.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Dominance
  it("D1", "I take charge quickly and push hard to get results.", "D"),
  it("D2", "I'm comfortable making bold decisions and tackling problems head-on.", "D"),
  it("D3", "I stay focused on the bottom line and winning, even under pressure.", "D"),
  it("D4", "I get impatient when things move too slowly or cautiously.", "D"),
  it("D5", "I'd rather lead than follow.", "D"),
  it("D6", "I'm blunt and direct about what I want.", "D"),
  // Influence
  it("I1", "I love meeting new people and easily strike up conversations.", "I"),
  it("I2", "I'm enthusiastic and can get others excited about an idea.", "I"),
  it("I3", "I persuade and inspire people more than I pressure them.", "I"),
  it("I4", "I'm optimistic and bring energy to a group.", "I"),
  it("I5", "Recognition and being well-liked matter a lot to me.", "I"),
  it("I6", "I think out loud and like to talk my ideas through with others.", "I"),
  // Steadiness
  it("S1", "I'm patient and steady, and prefer a calm, predictable pace.", "S"),
  it("S2", "I'm a dependable team player who quietly supports others.", "S"),
  it("S3", "I dislike sudden change and prefer stability.", "S"),
  it("S4", "I listen carefully and rarely rush people.", "S"),
  it("S5", "I value harmony and avoid conflict where I can.", "S"),
  it("S6", "People rely on me to be consistent and loyal.", "S"),
  // Conscientiousness / Compliance
  it("C1", "I pay close attention to accuracy, details, and quality.", "C"),
  it("C2", "I like clear rules, standards, and well-thought-out plans.", "C"),
  it("C3", "I analyze carefully before I decide.", "C"),
  it("C4", "I want things done correctly, even if it takes longer.", "C"),
  it("C5", "I trust facts and logic over gut feeling.", "C"),
  it("C6", "I hold myself and my work to high standards.", "C"),
];

/** English default; es/fr live in core/instruments/i18n.ts (discTypeStrings). */
const DISC_TYPE_EN: DiscTypeBundle = {
  meta: {
    D: { name: "Dominance", title: "The Driver", desc: "direct, decisive, results-driven", summary: "Direct and decisive, you drive for results and aren't afraid to take charge." },
    I: { name: "Influence", title: "The Inspirer", desc: "outgoing, enthusiastic, persuasive", summary: "Outgoing and enthusiastic, you connect with people and inspire them to act." },
    S: { name: "Steadiness", title: "The Supporter", desc: "patient, dependable, cooperative", summary: "Patient and dependable, you bring calm, loyalty, and steadiness to a team." },
    C: { name: "Conscientiousness", title: "The Analyst", desc: "precise, analytical, quality-focused", summary: "Precise and analytical, you value accuracy, structure, and doing things right." },
  },
  labels: { primary: "Primary style", secondary: "Secondary style", pattern: "Pattern", fullOrder: "Full order" },
  blend: "{a}/{b} blend", clear: "Clear {a}",
  blendDetail: "two styles run close together", clearDetail: "one style clearly leads",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = discTypeStrings(locale) ?? DISC_TYPE_EN;
  const arr = ["D", "I", "S", "C"].map((id) => ({ id, mean: s[id].mean }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const second = sorted[1];
  const sep = top.mean - second.mean;
  const blended = sep < 0.4;
  const meta = T.meta[top.id];
  const confidence = Math.max(0.2, Math.min(0.98, 0.5 + sep));

  return {
    code: blended ? `${top.id}${second.id}` : top.id,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.primary, value: `${top.id} — ${meta.name}`, detail: meta.desc },
      { label: T.labels.secondary, value: `${second.id} — ${T.meta[second.id].name}`, detail: T.meta[second.id].desc },
      { label: T.labels.pattern, value: blended ? T.blend.replace("{a}", top.id).replace("{b}", second.id) : T.clear.replace("{a}", top.id), detail: blended ? T.blendDetail : T.clearDetail },
      { label: T.labels.fullOrder, value: sorted.map((x) => x.id).join(" › ") },
    ],
    confidence,
    secondary: second.id,
  };
}

export const disc: Instrument = {
  id: "disc-4",
  name: "DISC Behavioral Styles",
  shortName: "DISC",
  kind: "typological",
  category: "types",
  tagline: "Four behavioral styles — how you act, decide, and work with others.",
  description:
    "DISC maps observable behavior across four styles — Dominance, Influence, Steadiness, and " +
    "Conscientiousness. Rather than a fixed type, most people are a blend, led by a primary and secondary " +
    "style. It's especially useful for communication, teamwork, and leadership.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the DISC framework (descended from Marston, 1928).",
  scales: [
    { id: "D", name: "Dominance", description: "Drive for results, directness, and control.", highDescriptor: "assertive, fast-paced, and results-focused", lowDescriptor: "modest, accommodating, and low-key about control", poles: { low: "Easygoing", high: "Driving" }, normMean: 3.2, normSd: 0.72 },
    { id: "I", name: "Influence", description: "Sociability, enthusiasm, and persuasion.", highDescriptor: "outgoing, expressive, and persuasive", lowDescriptor: "reserved, reflective, and understated", poles: { low: "Reserved", high: "Outgoing" }, normMean: 3.3, normSd: 0.72 },
    { id: "S", name: "Steadiness", description: "Patience, reliability, and cooperation.", highDescriptor: "steady, supportive, and harmony-seeking", lowDescriptor: "fast-changing, restless, and comfortable with flux", poles: { low: "Dynamic", high: "Steady" }, normMean: 3.4, normSd: 0.7 },
    { id: "C", name: "Conscientiousness", description: "Precision, analysis, and standards.", highDescriptor: "precise, careful, and quality-driven", lowDescriptor: "improvisational, big-picture, and rules-light", poles: { low: "Improvisational", high: "Precise" }, normMean: 3.4, normSd: 0.7 },
  ],
  items,
  resolveType,
  caveats: [
    "DISC describes behavioral style, not ability, intelligence, or worth — every style has real strengths.",
    "Most people flex between styles depending on context; read your top two together.",
    "It's a practical communication tool, not a clinically validated diagnostic test.",
  ],
  citations: [
    { ref: "Marston, W. M. (1928). Emotions of Normal People. Kegan Paul / Harcourt, Brace.", note: "Theoretical origin of the four-quadrant model." },
    { ref: "Sugerman, J., Scullard, M., & Wilhelm, E. (2011). The 8 Dimensions of Leadership: DiSC Strategies. Berrett-Koehler.", note: "Modern applied DISC framework." },
  ],
};

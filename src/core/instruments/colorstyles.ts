import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { colorTypeStrings, type ColorTypeBundle } from "./i18n";

/**
 * Four Color Styles (the "True Colors" / Insights team-temperament tradition).
 *
 * A friendly, color-coded read on working and relating style — Gold, Blue, Green,
 * and Orange. Original measure inspired by the color-temperament approach; not
 * affiliated with True Colors® or Insights Discovery®.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("G1", "I like clear plans, schedules, and doing things the proper way.", "GOLD"),
  it("G2", "I'm dependable, organized, and finish what I commit to.", "GOLD"),
  it("G3", "I value tradition, duty, and being responsible.", "GOLD"),
  it("G4", "I feel uneasy when things are disorganized or last-minute.", "GOLD"),
  it("B1", "I care deeply about people's feelings and harmony.", "BLUE"),
  it("B2", "I look for meaning, authenticity, and connection.", "BLUE"),
  it("B3", "I'm warm, empathetic, and a good listener.", "BLUE"),
  it("B4", "Helping others grow is one of my greatest joys.", "BLUE"),
  it("N1", "I think things through logically and value competence.", "GREEN"),
  it("N2", "I'm curious and love understanding how things work.", "GREEN"),
  it("N3", "I stay cool and analytical when others get emotional.", "GREEN"),
  it("N4", "I question assumptions and want evidence before I'm convinced.", "GREEN"),
  it("O1", "I'm spontaneous and love action, variety, and fun.", "ORANGE"),
  it("O2", "I act quickly and adapt easily in the moment.", "ORANGE"),
  it("O3", "I get restless with too many rules or routines.", "ORANGE"),
  it("O4", "I'm bold, playful, and like a bit of risk.", "ORANGE"),
];

/** Canonical, language-agnostic color codes (the English color names). */
const CODE_EN: Record<string, string> = { GOLD: "Gold", BLUE: "Blue", GREEN: "Green", ORANGE: "Orange" };

/** English default; es/fr live in core/instruments/i18n.ts (colorTypeStrings). */
const COLOR_TYPE_EN: ColorTypeBundle = {
  meta: {
    GOLD: { name: "Gold", title: "The Organizer", desc: "responsible, structured, dependable", summary: "Gold leads in you — responsible, organized, and loyal. You build the structure and follow-through that others rely on." },
    BLUE: { name: "Blue", title: "The Connector", desc: "warm, empathetic, meaning-seeking", summary: "Blue leads in you — warm, authentic, and people-centered. You nurture harmony, meaning, and the growth of those around you." },
    GREEN: { name: "Green", title: "The Thinker", desc: "analytical, curious, competence-driven", summary: "Green leads in you — logical, curious, and cool-headed. You master ideas and systems and prize competence." },
    ORANGE: { name: "Orange", title: "The Adventurer", desc: "spontaneous, energetic, bold", summary: "Orange leads in you — spontaneous, action-loving, and adaptable. You bring energy, courage, and a sense of play." },
  },
  labels: { lead: "Lead color", support: "Support color", spectrum: "Spectrum", pattern: "Pattern" },
  spectrumHint: "your colors, brightest first",
  blend: "A two-color blend",
  clear: (name) => `Clear ${name}`,
  blendDetail: "two colors run close",
  clearDetail: "one color clearly leads",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = colorTypeStrings(locale) ?? COLOR_TYPE_EN;
  const arr = ["GOLD", "BLUE", "GREEN", "ORANGE"].map((id) => ({ id, mean: s[id].mean }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const second = sorted[1];
  const sep = top.mean - second.mean;
  const blended = sep < 0.4;
  const meta = T.meta[top.id];
  const sName = T.meta[second.id].name;
  return {
    code: blended ? `${CODE_EN[top.id]}/${CODE_EN[second.id]}` : CODE_EN[top.id],
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.lead, value: meta.name, detail: meta.desc },
      { label: T.labels.support, value: sName, detail: T.meta[second.id].desc },
      { label: T.labels.spectrum, value: sorted.map((x) => T.meta[x.id].name).join(" › "), detail: T.spectrumHint },
      { label: T.labels.pattern, value: blended ? T.blend : T.clear(meta.name), detail: blended ? T.blendDetail : T.clearDetail },
    ],
    confidence: Math.max(0.2, Math.min(0.96, 0.5 + sep)),
    secondary: sName,
  };
}

export const colorStyles: Instrument = {
  id: "color-styles",
  name: "Four Color Styles",
  shortName: "Colors",
  kind: "typological",
  category: "types",
  tagline: "Gold, Blue, Green, Orange — your working and relating color.",
  description:
    "A friendly, color-coded snapshot of how you work and relate, in the tradition of True Colors and Insights " +
    "Discovery. Gold organizes, Blue connects, Green analyzes, and Orange adventures. Most people are a blend led by one " +
    "bright color — a quick, memorable language for teams, families, and self-awareness.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, inspired by the color-temperament tradition; not affiliated with True Colors® or Insights Discovery®.",
  scales: [
    { id: "GOLD", name: "Gold — Structure", description: "Responsibility, order, and duty.", highDescriptor: "organized, dependable, and dutiful", lowDescriptor: "loose and unstructured", poles: { low: "Flexible", high: "Structured" }, normMean: 3.3, normSd: 0.7 },
    { id: "BLUE", name: "Blue — Connection", description: "Empathy, harmony, and meaning.", highDescriptor: "warm, empathic, and harmony-seeking", lowDescriptor: "detached and matter-of-fact", poles: { low: "Detached", high: "Caring" }, normMean: 3.4, normSd: 0.7 },
    { id: "GREEN", name: "Green — Analysis", description: "Logic, curiosity, and competence.", highDescriptor: "analytical, cool-headed, and curious", lowDescriptor: "feeling-led and less analytical", poles: { low: "Intuitive", high: "Analytical" }, normMean: 3.3, normSd: 0.7 },
    { id: "ORANGE", name: "Orange — Action", description: "Spontaneity, energy, and boldness.", highDescriptor: "spontaneous, energetic, and bold", lowDescriptor: "steady and routine-loving", poles: { low: "Steady", high: "Spontaneous" }, normMean: 3.2, normSd: 0.72 },
  ],
  items,
  resolveType,
  caveats: [
    "Color systems are a friendly communication tool, not a validated scientific test — hold the label lightly.",
    "Everyone uses all four colors; your 'lead' is just what comes most naturally. Read your top two together.",
    "No color is better than another — each brings real gifts and real blind spots.",
  ],
  citations: [
    { ref: "Lowry, D. (1990). True Colors. (Color-temperament framework, building on Keirsey.)" },
    { ref: "Keirsey, D. (1998). Please Understand Me II. Prometheus Nemesis.", note: "Temperament lineage behind color systems." },
  ],
};

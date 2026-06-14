import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { anchorsTypeStrings, type RankedStyleBundle } from "./i18n";

/**
 * Career Anchors (Schein).
 *
 * Edgar Schein's research found that people organize careers around one dominant
 * "anchor" — the thing they would not give up if forced to choose. Eight anchors.
 * Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Not true of me", "Slightly", "Somewhat", "Mostly true", "Completely true of me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("TF1", "Being a recognized expert who's the best at a specific skill matters most to me.", "TF"),
  it("TF2", "I'd rather deepen my technical mastery than move into general management.", "TF"),
  it("GM1", "I'm driven to lead, manage people, and run the whole show.", "GM"),
  it("GM2", "Climbing to a senior leadership role is a core ambition.", "GM"),
  it("AU1", "Freedom to do work my own way matters more to me than status or money.", "AU"),
  it("AU2", "I chafe under rigid rules, bosses, and structure.", "AU"),
  it("SE1", "Security and stability matter more to me than risk or fast advancement.", "SE"),
  it("SE2", "I value a predictable, dependable career path.", "SE"),
  it("EC1", "I dream of building something of my own — a venture or creation.", "EC"),
  it("EC2", "Creating a business or product that's truly mine is a driving goal.", "EC"),
  it("SV1", "I want my work to serve a cause or make the world better.", "SV"),
  it("SV2", "Meaning and contribution matter more to me than money or rank.", "SV"),
  it("CH1", "I'm happiest tackling the hardest, seemingly impossible problems.", "CH"),
  it("CH2", "I seek out tough challenges and competition to win.", "CH"),
  it("LS1", "I want my career to fit around a balanced life, not dominate it.", "LS"),
  it("LS2", "Integrating work with family and personal life is non-negotiable for me.", "LS"),
];

/** Canonical, language-agnostic anchor codes. */
const CODE_EN: Record<string, string> = { TF: "Technical/Functional", GM: "General Management", AU: "Autonomy", SE: "Security/Stability", EC: "Entrepreneurial Creativity", SV: "Service/Dedication", CH: "Pure Challenge", LS: "Lifestyle" };

/** English default; es/fr live in core/instruments/i18n.ts (anchorsTypeStrings). */
const ANCHORS_TYPE_EN: RankedStyleBundle = {
  meta: {
    TF: { name: "Technical/Functional", title: "The Expert", desc: "mastery of a craft", summary: "Your anchor is deep expertise — you're at your best mastering a craft and being genuinely good at something specific." },
    GM: { name: "General Management", title: "The Leader", desc: "leading and integrating", summary: "Your anchor is management — you're drawn to leading people, integrating functions, and bearing responsibility for outcomes." },
    AU: { name: "Autonomy", title: "The Independent", desc: "freedom and self-direction", summary: "Your anchor is autonomy — freedom to work your own way matters more to you than rank, structure, or security." },
    SE: { name: "Security/Stability", title: "The Anchor", desc: "stability and predictability", summary: "Your anchor is security — you value a stable, dependable path and peace of mind over risk and rapid change." },
    EC: { name: "Entrepreneurial Creativity", title: "The Founder", desc: "building something new", summary: "Your anchor is creating — you're driven to build something of your own, a venture or product that bears your stamp." },
    SV: { name: "Service/Dedication", title: "The Servant", desc: "a cause worth serving", summary: "Your anchor is service — work must serve a cause and mean something; contribution outranks money and status." },
    CH: { name: "Pure Challenge", title: "The Challenger", desc: "hard problems to win", summary: "Your anchor is challenge — you live for hard problems and tough competition, and you need them to feel alive at work." },
    LS: { name: "Lifestyle", title: "The Integrator", desc: "a balanced whole life", summary: "Your anchor is lifestyle — you want a career that fits a balanced life, integrating work with family and self." },
  },
  labels: { dominant: "Primary anchor", secondary: "Secondary anchor", range: "Top three", profile: "Clarity" },
  lead: "a clear lead", blend: "anchors run close", profileDetail: "how decisively one anchor leads",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = anchorsTypeStrings(locale) ?? ANCHORS_TYPE_EN;
  const arr = Object.keys(CODE_EN).map((id) => ({ id, mean: s[id].mean }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const sep = top.mean - sorted[1].mean;
  const meta = T.meta[top.id];
  const sName = T.meta[sorted[1].id].name;
  return {
    code: CODE_EN[top.id],
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.dominant, value: meta.name, detail: meta.desc },
      { label: T.labels.secondary, value: sName, detail: T.meta[sorted[1].id].desc },
      { label: T.labels.range, value: sorted.slice(0, 3).map((x) => T.meta[x.id].name).join(" › ") },
      { label: T.labels.profile, value: sep >= 0.5 ? T.lead : T.blend, detail: T.profileDetail },
    ],
    confidence: Math.max(0.2, Math.min(0.95, 0.5 + sep)),
    secondary: sName,
  };
}

export const anchors: Instrument = {
  id: "career-anchors",
  name: "Career Anchors",
  shortName: "Anchors",
  kind: "typological",
  category: "career",
  tagline: "The one thing you wouldn't give up in a career.",
  description:
    "Edgar Schein found that as people gain experience, their careers come to revolve around a single 'anchor' — the " +
    "value or need they would not surrender if forced to choose. This profiler weighs all eight, from technical mastery " +
    "and management to autonomy, security, entrepreneurship, service, pure challenge, and lifestyle — and names the one " +
    "that anchors you.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Schein's Career Anchors model.",
  scales: [
    { id: "TF", name: "Technical/Functional", description: "Mastery of a specific area of expertise.", highDescriptor: "anchored in deep expertise", lowDescriptor: "less driven by technical mastery", poles: { low: "Less central", high: "Central" }, normMean: 3.3, normSd: 0.78 },
    { id: "GM", name: "General Management", description: "Leading, integrating, and bearing responsibility.", highDescriptor: "anchored in leadership and management", lowDescriptor: "less drawn to managing", poles: { low: "Less central", high: "Central" }, normMean: 3.0, normSd: 0.82 },
    { id: "AU", name: "Autonomy/Independence", description: "Freedom to work your own way.", highDescriptor: "anchored in independence", lowDescriptor: "comfortable within structure", poles: { low: "Less central", high: "Central" }, normMean: 3.3, normSd: 0.78 },
    { id: "SE", name: "Security/Stability", description: "Predictability and a dependable path.", highDescriptor: "anchored in security", lowDescriptor: "comfortable with risk and change", poles: { low: "Less central", high: "Central" }, normMean: 3.2, normSd: 0.8 },
    { id: "EC", name: "Entrepreneurial Creativity", description: "Building something new of your own.", highDescriptor: "anchored in creating ventures", lowDescriptor: "less drawn to founding things", poles: { low: "Less central", high: "Central" }, normMean: 2.9, normSd: 0.85 },
    { id: "SV", name: "Service/Dedication", description: "Serving a cause larger than yourself.", highDescriptor: "anchored in service and meaning", lowDescriptor: "less driven by a cause", poles: { low: "Less central", high: "Central" }, normMean: 3.3, normSd: 0.8 },
    { id: "CH", name: "Pure Challenge", description: "Overcoming hard problems and winning.", highDescriptor: "anchored in challenge and competition", lowDescriptor: "less driven by difficulty for its own sake", poles: { low: "Less central", high: "Central" }, normMean: 3.1, normSd: 0.8 },
    { id: "LS", name: "Lifestyle", description: "Integrating career with a balanced whole life.", highDescriptor: "anchored in work-life integration", lowDescriptor: "willing to let work dominate", poles: { low: "Less central", high: "Central" }, normMean: 3.5, normSd: 0.76 },
  ],
  items,
  resolveType,
  caveats: [
    "Most people have one clear anchor and a couple of close runners-up; read your top two or three together.",
    "Anchors clarify with experience — early in a career they can be fuzzy and shift.",
    "No anchor is better than another; the value is choosing roles that honor yours.",
  ],
  citations: [
    { ref: "Schein, E. H. (1990). Career Anchors: Discovering Your Real Values. Jossey-Bass / Pfeiffer." },
    { ref: "Schein, E. H. (1978). Career Dynamics: Matching Individual and Organizational Needs. Addison-Wesley." },
  ],
};

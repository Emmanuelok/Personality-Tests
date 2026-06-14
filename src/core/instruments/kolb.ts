import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { kolbTypeStrings, type KolbTypeBundle } from "./i18n";

/**
 * Kolb Learning Style (the experiential learning cycle).
 *
 * David Kolb mapped learning on two axes — how you grasp experience (concrete
 * feeling vs. abstract thinking) and how you transform it (active doing vs.
 * reflective watching). Their crossing yields four styles. Items are ORIGINAL to
 * this platform.
 */

// Kolb's two axes are forced choices: you grasp experience one way or the other, and
// transform it one way or the other. Picking between the poles places your style cleanly.
const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
/** Forced-choice pair on one bipolar axis: option 0 = high pole (+1), option 1 = low pole (−1). */
const fc = (id: string, scale: string, text: string, hi: string, lo: string): Item => ({
  id,
  text,
  scale,
  keyed: 1,
  options: [{ text: hi, scale, keyed: 1 }, { text: lo, scale, keyed: -1 }],
});

const items: Item[] = [
  // Grasping: high = Abstract (thinking), low = Concrete (feeling)
  fc("KG1", "GRASP", "You make sense of something new mainly by…", "analyzing the ideas and thinking it through", "feeling your way through the concrete experience"),
  fc("KG2", "GRASP", "You trust more…", "theories, concepts, and logical analysis", "direct, hands-on, personal experience"),
  fc("KG3", "GRASP", "You'd rather learn from…", "models and abstract principles", "the concrete specifics of the moment"),
  fc("KG4", "GRASP", "Your instinct is to…", "step back to the underlying idea", "stay with the tangible details"),
  // Transforming: high = Active (doing), low = Reflective (watching)
  fc("KT1", "TRANS", "You learn best by…", "doing and trying things out", "watching and reflecting first"),
  fc("KT2", "TRANS", "Faced with something new, you'd rather…", "jump in and experiment", "observe from several angles before acting"),
  fc("KT3", "TRANS", "You make sense of things by…", "acting on them", "thinking them over quietly"),
  fc("KT4", "TRANS", "Your default is to…", "get hands-on right away", "form a considered view first"),
];

type Key = "Diverging" | "Assimilating" | "Converging" | "Accommodating";

/** English default; es/fr live in core/instruments/i18n.ts (kolbTypeStrings). */
const KOLB_TYPE_EN: KolbTypeBundle = {
  meta: {
    Diverging: { name: "Diverging", title: "The Diverger", desc: "feel + watch", summary: "You learn by feeling and reflecting — imaginative and people-aware, you see situations from many angles and shine at generating ideas." },
    Assimilating: { name: "Assimilating", title: "The Assimilator", desc: "think + watch", summary: "You learn by thinking and reflecting — logical and concise, you're at your best with concepts, models, and well-organized ideas." },
    Converging: { name: "Converging", title: "The Converger", desc: "think + do", summary: "You learn by thinking and doing — a practical problem-solver, you excel at applying ideas to real, technical challenges." },
    Accommodating: { name: "Accommodating", title: "The Accommodator", desc: "feel + do", summary: "You learn by feeling and doing — hands-on and intuitive, you thrive on new experiences and adapt quickly in the moment." },
  },
  labels: { style: "Style", grasping: "Grasping", transforming: "Transforming", clarity: "Clarity" },
  abstract: { value: "Abstract (thinking)", detail: "ideas and analysis" },
  concrete: { value: "Concrete (feeling)", detail: "direct experience" },
  active: { value: "Active (doing)", detail: "experiment and act" },
  reflective: { value: "Reflective (watching)", detail: "observe and reflect" },
  clarityDetail: "how decisively both axes leaned",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = kolbTypeStrings(locale) ?? KOLB_TYPE_EN;
  const abstract = s.GRASP.normalized >= 50;
  const active = s.TRANS.normalized >= 50;
  const key: Key = abstract
    ? active ? "Converging" : "Assimilating"
    : active ? "Accommodating" : "Diverging";
  const meta = T.meta[key];
  const g = Math.abs(s.GRASP.normalized - 50) / 50;
  const t = Math.abs(s.TRANS.normalized - 50) / 50;
  return {
    code: key,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.style, value: meta.name, detail: meta.desc },
      { label: T.labels.grasping, value: abstract ? T.abstract.value : T.concrete.value, detail: abstract ? T.abstract.detail : T.concrete.detail },
      { label: T.labels.transforming, value: active ? T.active.value : T.reflective.value, detail: active ? T.active.detail : T.reflective.detail },
      { label: T.labels.clarity, value: `${Math.round((g + t) * 50)}/100`, detail: T.clarityDetail },
    ],
    confidence: Math.max(0.2, Math.min(0.95, 0.45 + (g + t) / 2)),
  };
}

export const kolb: Instrument = {
  id: "kolb-learning",
  name: "Kolb Learning Style",
  shortName: "Kolb",
  kind: "typological",
  format: "choice",
  category: "learning",
  tagline: "Diverging, Assimilating, Converging, Accommodating — your learning style.",
  description:
    "David Kolb's experiential learning model maps how you learn on two axes: how you take experience in (by concrete " +
    "feeling or abstract thinking) and how you act on it (by reflective watching or active doing). The crossing yields " +
    "four styles — Diverging, Assimilating, Converging, and Accommodating — each with its own way of turning experience " +
    "into understanding.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Kolb's experiential learning theory.",
  scales: [
    { id: "GRASP", name: "Grasping", description: "How you take experience in.", highDescriptor: "abstract — through analysis and concepts", lowDescriptor: "concrete — through direct feeling and experience", poles: { low: "Concrete (feeling)", high: "Abstract (thinking)" }, normMean: 3.0, normSd: 0.72 },
    { id: "TRANS", name: "Transforming", description: "How you act on experience.", highDescriptor: "active — by experimenting and doing", lowDescriptor: "reflective — by observing and pondering", poles: { low: "Reflective (watching)", high: "Active (doing)" }, normMean: 3.0, normSd: 0.72 },
  ],
  items,
  resolveType,
  caveats: [
    "Kolb's learning-cycle is a useful way to think about learning, but the Learning Style Inventory's psychometrics (reliability, stability) have been widely criticized — hold the label lightly.",
    "Like other style models, there's little evidence that teaching to your style improves outcomes. The most powerful idea here is the full cycle: feel, watch, think, and do.",
    "Your style can shift with the task and over time; it's a tendency, not a fixed trait.",
  ],
  citations: [
    { ref: "Kolb, D. A. (1984). Experiential Learning: Experience as the Source of Learning and Development. Prentice-Hall." },
    { ref: "Kolb, A. Y., & Kolb, D. A. (2005). Learning styles and learning spaces. Academy of Management Learning & Education, 4(2), 193–212." },
  ],
};

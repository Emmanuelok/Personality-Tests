import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Kolb Learning Style (the experiential learning cycle).
 *
 * David Kolb mapped learning on two axes — how you grasp experience (concrete
 * feeling vs. abstract thinking) and how you transform it (active doing vs.
 * reflective watching). Their crossing yields four styles. Items are ORIGINAL to
 * this platform.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "Slightly", "Somewhat", "Mostly like me", "Exactly like me"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Grasping: high = Abstract (thinking), low = Concrete (feeling)
  it("G1", "I learn by analyzing ideas and thinking things through.", "GRASP"),
  it("G2", "I rely on theories and concepts to make sense of experience.", "GRASP"),
  it("G3", "I trust logical analysis over gut feeling.", "GRASP"),
  it("G4", "I learn best by feeling my way through a concrete experience.", "GRASP", -1),
  it("G5", "I tune into the specifics of the moment more than abstract theory.", "GRASP", -1),
  it("G6", "I learn most from direct, personal, hands-on experience.", "GRASP", -1),
  // Transforming: high = Active (doing), low = Reflective (watching)
  it("T1", "I learn by doing and trying things out.", "TRANS"),
  it("T2", "I'd rather jump in and experiment than sit and watch.", "TRANS"),
  it("T3", "I make sense of things by acting on them.", "TRANS"),
  it("T4", "I learn best by watching and reflecting before I act.", "TRANS", -1),
  it("T5", "I like to observe from several angles before forming a view.", "TRANS", -1),
  it("T6", "I prefer to think things over quietly rather than dive in.", "TRANS", -1),
];

type Key = "Diverging" | "Assimilating" | "Converging" | "Accommodating";
const META: Record<Key, { title: string; desc: string; summary: string }> = {
  Diverging: { title: "The Diverger", desc: "feel + watch", summary: "You learn by feeling and reflecting — imaginative and people-aware, you see situations from many angles and shine at generating ideas." },
  Assimilating: { title: "The Assimilator", desc: "think + watch", summary: "You learn by thinking and reflecting — logical and concise, you're at your best with concepts, models, and well-organized ideas." },
  Converging: { title: "The Converger", desc: "think + do", summary: "You learn by thinking and doing — a practical problem-solver, you excel at applying ideas to real, technical challenges." },
  Accommodating: { title: "The Accommodator", desc: "feel + do", summary: "You learn by feeling and doing — hands-on and intuitive, you thrive on new experiences and adapt quickly in the moment." },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const abstract = s.GRASP.normalized >= 50;
  const active = s.TRANS.normalized >= 50;
  const key: Key = abstract
    ? active ? "Converging" : "Assimilating"
    : active ? "Accommodating" : "Diverging";
  const meta = META[key];
  const g = Math.abs(s.GRASP.normalized - 50) / 50;
  const t = Math.abs(s.TRANS.normalized - 50) / 50;
  return {
    code: key,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: "Style", value: key, detail: meta.desc },
      { label: "Grasping", value: abstract ? "Abstract (thinking)" : "Concrete (feeling)", detail: abstract ? "ideas and analysis" : "direct experience" },
      { label: "Transforming", value: active ? "Active (doing)" : "Reflective (watching)", detail: active ? "experiment and act" : "observe and reflect" },
      { label: "Clarity", value: `${Math.round((g + t) * 50)}/100`, detail: "how decisively both axes leaned" },
    ],
    confidence: Math.max(0.2, Math.min(0.95, 0.45 + (g + t) / 2)),
  };
}

export const kolb: Instrument = {
  id: "kolb-learning",
  name: "Kolb Learning Style",
  shortName: "Kolb",
  kind: "typological",
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

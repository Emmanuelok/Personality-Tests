import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { darkTetradTypeStrings, type DarkTetradTypeBundle } from "./i18n";

/**
 * Dark Tetrad (Machiavellianism · Narcissism · Psychopathy · Sadism).
 *
 * The Dark Triad plus everyday sadism — the four "dark" but sub-clinical traits
 * that capture socially aversive tendencies in the normal range. Grounded in the
 * Short Dark Tetrad (SD4) tradition; items are ORIGINAL to this platform and the
 * framing is strictly educational and non-diagnostic.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Machiavellianism — strategic manipulation
  it("M1", "It's smart to keep some information back to use later.", "MACH"),
  it("M2", "I'm willing to manage a situation behind the scenes to come out ahead.", "MACH"),
  it("M3", "I avoid showing my true intentions when it benefits me.", "MACH"),
  it("M4", "Most people can be influenced with the right approach.", "MACH"),
  // Narcissism — grandiosity, status
  it("N1", "I deserve more recognition than I usually get.", "NARC"),
  it("N2", "I like being the center of attention.", "NARC"),
  it("N3", "I'm more capable than most of the people around me.", "NARC"),
  it("N4", "I expect others to notice how special I am.", "NARC"),
  // Psychopathy — callousness, impulsivity
  it("P1", "I rarely feel guilty after hurting someone.", "PSY"),
  it("P2", "I'll take risks even if others could get hurt.", "PSY"),
  it("P3", "I tend to act first and worry about the consequences later.", "PSY"),
  it("P4", "Other people's feelings don't affect my decisions much.", "PSY"),
  // Sadism — enjoyment of others' discomfort
  it("S1", "I'll admit there can be a certain thrill in seeing someone squirm.", "SAD"),
  it("S2", "I sometimes enjoy mocking or putting people down.", "SAD"),
  it("S3", "I find it satisfying to dominate someone who has annoyed me.", "SAD"),
  it("S4", "Intense or violent entertainment appeals to me.", "SAD"),
];

/** Canonical, language-agnostic trait names (the code slices the English name). */
const CODE_EN: Record<string, string> = { MACH: "Machiavellianism", NARC: "Narcissism", PSY: "Psychopathy", SAD: "Sadism" };

/** English default; es/fr live in core/instruments/i18n.ts (darkTetradTypeStrings). */
const DARKTETRAD_TYPE_EN: DarkTetradTypeBundle = {
  meta: {
    MACH: { name: "Machiavellianism", title: "The Strategist", desc: "calculating, controlling, pragmatic", summary: "Your most pronounced dark trait is strategic manipulation — reading angles, keeping cards close, and steering outcomes. Used ethically, it's political savvy; unchecked, it erodes trust." },
    NARC: { name: "Narcissism", title: "The Spotlight", desc: "grandiose, status-seeking, self-enhancing", summary: "Your most pronounced dark trait is narcissism — a hunger for recognition and a sense of being exceptional. It can fuel ambition and charisma, but tips into entitlement and fragile pride." },
    PSY: { name: "Psychopathy", title: "The Daredevil", desc: "bold, callous, impulsive", summary: "Your most pronounced dark trait is sub-clinical psychopathy — coolness under threat, risk appetite, and low guilt. It brings fearlessness, but can read as cold or reckless to others." },
    SAD: { name: "Sadism", title: "The Antagonist", desc: "confrontational, enjoys others' discomfort", summary: "Your most pronounced dark trait is everyday sadism — a pull toward others' discomfort. Naming it honestly is exactly how you keep it from steering your behavior." },
  },
  labels: { dominant: "Dominant trait", load: "Overall dark load", profile: "Profile", lightest: "Lightest trait" },
  loadHigh: "elevated — worth honest reflection", loadMid: "around average", loadLow: "low — these tendencies are muted in you",
  profileHint: "your four traits, strongest first", lightestHint: "where these tendencies are weakest",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = darkTetradTypeStrings(locale) ?? DARKTETRAD_TYPE_EN;
  const arr = ["MACH", "NARC", "PSY", "SAD"].map((id) => ({ id, mean: s[id].mean, norm: s[id].normalized }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const load = Math.round(arr.reduce((sum, x) => sum + x.norm, 0) / arr.length);
  const meta = T.meta[top.id];
  const sep = top.mean - sorted[1].mean;
  const confidence = Math.max(0.2, Math.min(0.96, 0.45 + sep));
  return {
    code: `${CODE_EN[top.id].slice(0, 4)} · ${load}/100`,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.dominant, value: meta.name, detail: meta.desc },
      { label: T.labels.load, value: `${load}/100`, detail: load >= 60 ? T.loadHigh : load >= 40 ? T.loadMid : T.loadLow },
      { label: T.labels.profile, value: sorted.map((x) => x.id).join(" › "), detail: T.profileHint },
      { label: T.labels.lightest, value: T.meta[sorted[3].id].name, detail: T.lightestHint },
    ],
    confidence,
    secondary: T.meta[sorted[1].id].name,
  };
}

export const darkTetrad: Instrument = {
  id: "dark-tetrad-18",
  name: "Dark Tetrad",
  shortName: "Dark Tetrad",
  kind: "typological",
  category: "shadow",
  tagline: "The Dark Triad plus everyday sadism — your aversive side, seen honestly.",
  description:
    "The Dark Tetrad extends the Dark Triad — Machiavellianism, Narcissism, and Psychopathy — with everyday Sadism. " +
    "These are normal-range, sub-clinical tendencies that everyone has in some measure. Seeing yours clearly is not a " +
    "verdict; it's the first step to keeping the darker currents from quietly steering your choices.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Short Dark Tetrad (SD4) research tradition.",
  scales: [
    { id: "MACH", name: "Machiavellianism", description: "Strategic manipulation and cynicism.", highDescriptor: "calculating, strategic, and guarded", lowDescriptor: "straightforward, open, and trusting", poles: { low: "Candid", high: "Calculating" }, normMean: 2.9, normSd: 0.78 },
    { id: "NARC", name: "Narcissism", description: "Grandiosity and need for admiration.", highDescriptor: "self-enhancing and status-seeking", lowDescriptor: "modest and self-effacing", poles: { low: "Humble", high: "Grandiose" }, normMean: 2.8, normSd: 0.8 },
    { id: "PSY", name: "Psychopathy", description: "Callousness, boldness, and impulsivity (sub-clinical).", highDescriptor: "cool, fearless, and low in guilt", lowDescriptor: "cautious, empathic, and conscientious", poles: { low: "Tender", high: "Callous" }, normMean: 2.4, normSd: 0.72 },
    { id: "SAD", name: "Everyday Sadism", description: "Enjoyment of others' discomfort.", highDescriptor: "drawn to confrontation and others' discomfort", lowDescriptor: "averse to causing or watching harm", poles: { low: "Gentle", high: "Sadistic" }, normMean: 2.1, normSd: 0.74 },
  ],
  items,
  resolveType,
  caveats: [
    "This is an educational self-reflection tool, NOT a clinical assessment. It cannot and does not diagnose narcissism, psychopathy, or any disorder.",
    "Everyone scores somewhere on every trait — a higher score is a tendency to be aware of and manage, not a label or a life sentence.",
    "These traits exist on a normal-range continuum; clinical conditions are diagnosed by professionals using very different methods.",
    "If a result is distressing, treat it as useful information and, if you'd like support, talk it through with a qualified professional.",
  ],
  citations: [
    { ref: "Paulhus, D. L., Buckels, E. E., Trapnell, P. D., & Jones, D. N. (2021). Screening for dark personalities: The Short Dark Tetrad (SD4). European Journal of Psychological Assessment, 37(3), 208–222." },
    { ref: "Buckels, E. E., Jones, D. N., & Paulhus, D. L. (2013). Behavioral confirmation of everyday sadism. Psychological Science, 24(11), 2201–2209." },
  ],
};

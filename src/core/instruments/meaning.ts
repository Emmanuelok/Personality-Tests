import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { meaningTypeStrings, type MeaningTypeBundle } from "./i18n";

/**
 * Meaning in Life (Steger) — two distinct strands of how meaningful life feels:
 * the PRESENCE of meaning (you feel your life has meaning and purpose) and the
 * SEARCH for meaning (you're actively seeking or deepening it). They're largely
 * independent — you can feel rich in meaning and still keep exploring — so the
 * profiler reads them as a 2×2 of presence × search. Items are ORIGINAL to this
 * platform, grounded in the Meaning in Life Questionnaire (MLQ) tradition.
 * Educational self-reflection, not a clinical measure.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Presence of Meaning — feeling your life has meaning and purpose
  it("P1", "I understand what makes my life feel meaningful.", "PRES"),
  it("P2", "My life has a clear sense of purpose.", "PRES"),
  it("P3", "I have discovered a satisfying purpose for my life.", "PRES"),
  it("P4", "I have a good sense of what makes my life worthwhile.", "PRES"),
  it("P5", "When I consider my life, I can see what gives it meaning.", "PRES"),
  // Search for Meaning — actively seeking or deepening meaning
  it("S1", "I am searching for something that makes my life feel significant.", "SRCH"),
  it("S2", "I am looking for a purpose or mission for my life.", "SRCH"),
  it("S3", "I am always trying to figure out what my life is about.", "SRCH"),
  it("S4", "I am seeking a deeper sense of meaning in my life.", "SRCH"),
  it("S5", "I am on the lookout for what truly matters to me.", "SRCH"),
];

/** Canonical, language-agnostic quadrant codes (presence × search). */
const CODE: Record<string, string> = {
  HP_LS: "Anchored in Meaning",
  HP_HS: "Deepening Meaning",
  LP_HS: "Searching for Meaning",
  LP_LS: "Open Horizon",
};

/** English default; es/fr live in core/instruments/i18n.ts (meaningTypeStrings). */
const MEANING_TYPE_EN: MeaningTypeBundle = {
  quads: {
    HP_LS: { title: "Anchored in Meaning", summary: "You feel a clear, settled sense that your life has meaning, and you're not restlessly searching for it. This is the profile most consistently linked to wellbeing — a stable foundation. Keep living it through what matters to you, and stay open to letting it deepen over time." },
    HP_HS: { title: "Deepening Meaning", summary: "You already feel your life has meaning — and you keep actively exploring and deepening it. This curious, engaged stance often goes with growth, openness, and a rich inner life. The art is to enjoy the search without losing sight of the meaning you've already found." },
    LP_HS: { title: "Searching for Meaning", summary: "You're actively looking for a stronger sense of meaning you don't fully feel yet. Searching is a normal — often growthful — part of life, especially in transitions, though it can feel unsettled. Small steps toward what matters, and real connection with others, tend to turn search into presence." },
    LP_LS: { title: "Open Horizon", summary: "Right now you neither feel a strong sense of meaning nor are actively searching for one. That's a common, low-pressure place to be — and an open invitation. Trying things you care about, contributing to others, and noticing what moves you are the most reliable ways meaning starts to take root." },
  },
  labels: { presence: "Presence of meaning", search: "Search for meaning", profile: "Your meaning profile" },
  levels: { high: "high", low: "low" },
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = meaningTypeStrings(locale) ?? MEANING_TYPE_EN;
  const pres = s.PRES.normalized;
  const srch = s.SRCH.normalized;
  const hiP = pres >= 50;
  const hiS = srch >= 50;
  const key = hiP ? (hiS ? "HP_HS" : "HP_LS") : (hiS ? "LP_HS" : "LP_LS");
  const q = T.quads[key];
  return {
    code: CODE[key],
    title: q.title,
    summary: q.summary,
    components: [
      { label: T.labels.presence, value: hiP ? T.levels.high : T.levels.low, detail: `${Math.round(pres)}/100` },
      { label: T.labels.search, value: hiS ? T.levels.high : T.levels.low, detail: `${Math.round(srch)}/100` },
      { label: T.labels.profile, value: q.title },
    ],
    confidence: Math.max(0.2, Math.min(0.95, (Math.abs(pres - 50) + Math.abs(srch - 50)) / 100 + 0.45)),
  };
}

export const meaning: Instrument = {
  id: "meaning-mlq",
  name: "Meaning in Life",
  shortName: "Meaning",
  kind: "typological",
  category: "wellbeing",
  tagline: "Two strands of meaning: how much you feel it, and how much you're seeking it.",
  description:
    "Meaning in life has two distinct sides, and Michael Steger's research shows they move largely independently: " +
    "the PRESENCE of meaning — feeling your life has purpose and significance — and the SEARCH for meaning — actively " +
    "seeking it out or deepening it. You can be rich in meaning and still exploring, or searching for a sense you " +
    "don't yet feel. This profiler reads both and places you in the presence × search landscape, with a compassionate, " +
    "growth-oriented take on whatever combination is yours right now.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Meaning in Life Questionnaire (MLQ) tradition.",
  scales: [
    { id: "PRES", name: "Presence of Meaning", description: "Feeling that your life has meaning, purpose, and significance.", highDescriptor: "with a clear, felt sense that your life has meaning", lowDescriptor: "less certain, right now, of what makes your life meaningful", poles: { low: "Unclear", high: "Clear sense" }, normMean: 3.3, normSd: 0.9 },
    { id: "SRCH", name: "Search for Meaning", description: "Actively seeking, building, or deepening a sense of meaning.", highDescriptor: "actively searching for or deepening your sense of meaning", lowDescriptor: "not currently on an active search for meaning", poles: { low: "At rest", high: "Seeking" }, normMean: 3.4, normSd: 0.9 },
  ],
  items,
  resolveType,
  caveats: [
    "Searching for meaning is normal and often healthy — especially during transitions and growth. It is not a deficiency, though search without much presence can feel unsettled.",
    "Presence of meaning is one of the most robust correlates of wellbeing, but meaning is built — through engagement, relationships, and contribution — so it can grow at any age.",
    "This is an educational self-reflection, not a clinical measure. A long, heavy absence of meaning paired with low mood is worth talking through with someone.",
  ],
  citations: [
    { ref: "Steger, M. F., Frazier, P., Oishi, S., & Kaler, M. (2006). The Meaning in Life Questionnaire: Assessing the presence of and search for meaning in life. Journal of Counseling Psychology, 53(1), 80–93." },
    { ref: "Steger, M. F. (2012). Experiencing meaning in life: Optimal functioning at the nexus of well-being, psychopathology, and spirituality. In P. T. P. Wong (Ed.), The Human Quest for Meaning (2nd ed.)." },
    { ref: "Steger, M. F., Oishi, S., & Kashdan, T. B. (2009). Meaning in life across the life span. The Journal of Positive Psychology, 4(1), 43–52." },
  ],
};

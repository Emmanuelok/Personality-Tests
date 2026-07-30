import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { chronotypeTypeStrings, type ChronotypeTypeBundle } from "./i18n";

/**
 * Chronotype (Morningness–Eveningness) — your body's natural timing for energy,
 * focus, and sleep. Items are ORIGINAL to this platform, grounded in the
 * morningness–eveningness tradition (Horne & Östberg). Aligning your hardest work
 * and your sleep with your chronotype is a quiet but powerful lifestyle lever.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("M1", "I naturally wake up early and feel alert soon after.", "MORN", 1),
  it("M2", "I do my sharpest thinking in the first half of the day.", "MORN", 1),
  it("M3", "I start to fade and feel sleepy fairly early in the evening.", "MORN", 1),
  it("M4", "If I could choose freely, I'd go to bed early and rise early.", "MORN", 1),
  it("M5", "I hit my stride in the evening and at night.", "MORN", -1),
  it("M6", "I'd much rather stay up late than have to get up early.", "MORN", -1),
  it("M7", "Mornings are hard for me — I need hours to feel fully human.", "MORN", -1),
  it("M8", "My energy and creativity peak after dark.", "MORN", -1),
];

/** English default; es/fr live in core/instruments/i18n.ts (chronotypeTypeStrings). */
const CHRONO_TYPE_EN: ChronotypeTypeBundle = {
  meta: {
    Lark: { title: "The Early Bird (Lark)", summary: "You're wired for the morning — alert early, sharpest before noon, and ready to wind down at night.", peak: "morning (roughly 8am–noon)", best: "Protect your mornings for your hardest, most important work." },
    Owl: { title: "The Night Owl", summary: "You're wired for the evening — slow to start, but focused and creative once the day winds down.", peak: "late afternoon to night", best: "Defend your late-day focus; avoid scheduling demanding work at 9am if you can." },
    Hummingbird: { title: "The Hummingbird (Intermediate)", summary: "You're flexible — neither strongly morning nor evening, able to adapt your peak to your schedule.", peak: "midday, and adaptable", best: "Notice your daily energy curve and slot deep work into your real peak." },
  },
  labels: { chronotype: "Chronotype", peak: "Your peak hours", best: "Best move", watch: "Watch" },
  watch: "Fighting your chronotype with stimulants and willpower works for a while, then taxes sleep, mood, and health.",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = chronotypeTypeStrings(locale) ?? CHRONO_TYPE_EN;
  const n = s.MORN.normalized;
  const code = n >= 60 ? "Lark" : n <= 40 ? "Owl" : "Hummingbird";
  const m = T.meta[code];
  return {
    code,
    title: m.title,
    summary: m.summary,
    components: [
      { label: T.labels.chronotype, value: m.title },
      { label: T.labels.peak, value: m.peak },
      { label: T.labels.best, value: m.best },
      { label: T.labels.watch, value: T.watch },
    ],
    confidence: Math.max(0.3, Math.min(0.97, Math.abs(n - 50) / 50 + 0.45)),
  };
}

export const chronotype: Instrument = {
  id: "chronotype",
  name: "Chronotype (Lark or Owl)",
  shortName: "Chronotype",
  kind: "typological",
  category: "emotional",
  tagline: "Your body's natural clock — when you're truly at your best.",
  description:
    "Your chronotype is your biological tendency toward morningness or eveningness — it shapes when you're " +
    "alert, when you focus best, and when you should sleep. Most people fight it; aligning with it is a simple, " +
    "research-backed way to feel sharper and rest better.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the morningness–eveningness tradition (Horne & Östberg).",
  scales: [
    { id: "MORN", name: "Morningness–Eveningness", description: "Where your natural energy and sleep timing fall.", highDescriptor: "an early riser, alert and focused in the morning", lowDescriptor: "an evening person, at your best after dark", poles: { low: "Night Owl", high: "Early Bird" }, normMean: 3.0, normSd: 0.9 },
  ],
  items,
  resolveType,
  caveats: [
    "Chronotype shifts across the lifespan (teens skew late; it advances earlier with age).",
    "Self-report captures preference; actual sleep timing is also shaped by your obligations and light exposure.",
    "A wellbeing lens, not a medical assessment — see a professional for persistent sleep problems.",
  ],
  citations: [
    { ref: "Horne, J. A., & Östberg, O. (1976). A self-assessment questionnaire to determine morningness–eveningness. International Journal of Chronobiology, 4(2), 97–110." },
    { ref: "Roenneberg, T., et al. (2007). Epidemiology of the human circadian clock. Sleep Medicine Reviews, 11(6), 429–438." },
  ],
};

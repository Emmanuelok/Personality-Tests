import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { loveLangTypeStrings, type LoveLangTypeBundle } from "./i18n";

/**
 * Love Languages (five ways of giving and receiving love).
 *
 * A popular framework (Chapman, 1992) describing five "languages" through which
 * people most feel loved. Items are ORIGINAL to this platform. It is widely used
 * for relationship communication; note it is a practical framework rather than a
 * heavily peer-validated psychometric scale.
 */

// Love Languages is naturally forced/multiple-choice: each scenario offers one option per
// language and you pick what lands deepest, so the result is your true ranking of the five —
// not five separate agreement ratings (which tend to all run high).
const L = { min: 1, max: 5, labels: ["Not really", "A little", "Somewhat", "A lot", "Exactly"] };
const SCALES5 = ["WORDS", "TIME", "SERVICE", "GIFTS", "TOUCH"] as const;
/** Build a single-select scenario whose five options each vote for one love language. */
const mc = (id: string, primary: string, text: string, opts: [string, string, string, string, string]): Item => ({
  id,
  text,
  scale: primary,
  keyed: 1,
  options: SCALES5.map((s, i) => ({ text: opts[i], scale: s })),
});

const items: Item[] = [
  mc("LL1", "WORDS", "After a hard week, what from a loved one would mean the most?", ["hearing “I'm proud of you — you've got this”", "an evening with their full, undistracted attention", "them quietly handling a chore you'd been dreading", "a small surprise that says they were thinking of you", "a long hug and sitting close together"]),
  mc("LL2", "TIME", "You feel most loved in a relationship when your partner…", ["tells you often what they appreciate about you", "sets aside real, focused time for just the two of you", "pitches in and lightens your load without being asked", "brings you little tokens that show they remembered", "is warmly affectionate — hugs, hand-holding, closeness"]),
  mc("LL3", "SERVICE", "A friend wants to show they care. You'd be most touched if they…", ["wrote you a heartfelt message", "cleared their day to spend it with you", "showed up to help you move or fix something", "brought a small gift that fit you perfectly", "greeted you with a big, warm hug"]),
  mc("LL4", "GIFTS", "What would hurt most to go without from someone close?", ["any words of appreciation or encouragement", "real, undivided time together", "any practical help or support", "any sign they think of you when you're apart", "affectionate physical closeness"]),
  mc("LL5", "TOUCH", "On your birthday, the gesture that lands deepest is…", ["a sincere note about what you mean to them", "an unhurried day spent entirely with you", "them taking everything off your plate that day", "a meaningful, well-chosen present", "lots of warmth and physical affection"]),
  mc("LL6", "WORDS", "You instinctively show others love by…", ["telling them what you admire about them", "giving them your full presence", "doing helpful things for them", "picking out thoughtful gifts", "hugging them and being physically affectionate"]),
  mc("LL7", "TIME", "Which compliment about your relationship would please you most?", ["“They always make me feel appreciated.”", "“We really make time for each other.”", "“They're always there to help me.”", "“They give the most thoughtful gifts.”", "“You can tell how affectionate they are.”"]),
  mc("LL8", "SERVICE", "After a disagreement, what helps you feel reconnected fastest?", ["a sincere, reassuring talk", "spending calm time together again", "them doing something kind to make up for it", "a small peace-offering that shows they care", "a hug and physical closeness"]),
  mc("LL9", "GIFTS", "When you miss someone, you most wish you could…", ["hear them say something warm", "just be present together", "have them help with what's on your plate", "find a little something that reminds you of them", "hold them, or be held"]),
  mc("LL10", "TOUCH", "The phrase that resonates most with you is…", ["“Tell me you love me.”", "“Spend time with me.”", "“Let me help you.”", "“I got you something.”", "“Hold me.”"]),
];

/** Canonical, language-agnostic codes (the English language names) for stable scoring. */
const CODE_EN: Record<string, string> = { WORDS: "Words of Affirmation", TIME: "Quality Time", SERVICE: "Acts of Service", GIFTS: "Receiving Gifts", TOUCH: "Physical Touch" };

/** English default; es/fr live in core/instruments/i18n.ts (loveLangTypeStrings). */
const LOVE_TYPE_EN: LoveLangTypeBundle = {
  meta: {
    WORDS: { name: "Words of Affirmation", summary: "You feel most loved through spoken and written appreciation — compliments, encouragement, and 'I love you.'" },
    TIME: { name: "Quality Time", summary: "You feel most loved through focused, undivided attention and shared presence." },
    SERVICE: { name: "Acts of Service", summary: "You feel most loved when people do helpful things for you — actions over words." },
    GIFTS: { name: "Receiving Gifts", summary: "You feel most loved through thoughtful, meaningful gifts that say 'I was thinking of you.'" },
    TOUCH: { name: "Physical Touch", summary: "You feel most loved through affectionate physical closeness — hugs, hand-holding, and warmth." },
  },
  primary: "Primary language", secondary: "Secondary language", ranking: "Full ranking", tipLabel: "Tip",
  primaryPrefix: "Primary: ",
  tip: (name) => `Ask loved ones for more ${name}, and learn to 'speak' theirs too.`,
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = loveLangTypeStrings(locale) ?? LOVE_TYPE_EN;
  const arr = SCALES5.map((id) => ({ id, n: s[id].normalized }));
  const sorted = [...arr].sort((a, b) => b.n - a.n);
  const top = sorted[0];
  const second = sorted[1];
  const meta = T.meta[top.id];
  const confidence = Math.max(0.2, Math.min(0.98, 0.5 + (top.n - second.n) / 100));
  return {
    code: CODE_EN[top.id],
    title: `${T.primaryPrefix}${meta.name}`,
    summary: meta.summary,
    components: [
      { label: T.primary, value: meta.name },
      { label: T.secondary, value: T.meta[second.id].name },
      { label: T.ranking, value: sorted.map((x) => T.meta[x.id].name.split(" ")[0]).join(" › ") },
      { label: T.tipLabel, value: T.tip(meta.name.toLowerCase()) },
    ],
    confidence,
    secondary: T.meta[second.id].name,
  };
}

export const loveLanguages: Instrument = {
  id: "love-languages",
  name: "Love Languages",
  shortName: "Love Languages",
  kind: "typological",
  format: "choice",
  category: "relationships",
  tagline: "How you most deeply give and receive love.",
  description:
    "The five love languages describe the different ways people feel loved — through words, time, service, " +
    "gifts, or touch. Knowing your primary language (and your partner's) is a simple, powerful way to make " +
    "love land. This profiler ranks all five and highlights your top two.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, based on Chapman's five love languages framework.",
  scales: [
    { id: "WORDS", name: "Words of Affirmation", description: "Feeling loved through appreciation and encouragement.", highDescriptor: "energized by kind, affirming words", lowDescriptor: "less reliant on verbal affirmation", normMean: 3.5, normSd: 0.85 },
    { id: "TIME", name: "Quality Time", description: "Feeling loved through focused togetherness.", highDescriptor: "filled up by undivided attention and presence", lowDescriptor: "less dependent on dedicated time together", normMean: 3.7, normSd: 0.8 },
    { id: "SERVICE", name: "Acts of Service", description: "Feeling loved when others help and do.", highDescriptor: "moved by helpful actions and shared load", lowDescriptor: "less focused on practical help as love", normMean: 3.5, normSd: 0.8 },
    { id: "GIFTS", name: "Receiving Gifts", description: "Feeling loved through thoughtful tokens.", highDescriptor: "touched by meaningful gifts and gestures", lowDescriptor: "less oriented to gifts as a love signal", normMean: 3.0, normSd: 0.9 },
    { id: "TOUCH", name: "Physical Touch", description: "Feeling loved through affectionate closeness.", highDescriptor: "connected through hugs, touch, and closeness", lowDescriptor: "less reliant on physical touch", normMean: 3.4, normSd: 0.9 },
  ],
  items,
  resolveType,
  caveats: [
    "A communication tool, not a validated personality test — but a genuinely useful lens for relationships.",
    "Most people use several languages; your top two together tell the richer story.",
    "Languages can shift across relationships and seasons of life.",
  ],
  citations: [
    { ref: "Chapman, G. (1992). The Five Love Languages: How to Express Heartfelt Commitment to Your Mate. Northfield Publishing." },
  ],
};

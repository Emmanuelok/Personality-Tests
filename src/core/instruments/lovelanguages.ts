import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Love Languages (five ways of giving and receiving love).
 *
 * A popular framework (Chapman, 1992) describing five "languages" through which
 * people most feel loved. Items are ORIGINAL to this platform. It is widely used
 * for relationship communication; note it is a practical framework rather than a
 * heavily peer-validated psychometric scale.
 */

const L = { min: 1, max: 5, labels: ["Not really", "A little", "Somewhat", "A lot", "Exactly"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("WA1", "I feel most loved when someone tells me they appreciate me.", "WORDS"),
  it("WA2", "Kind, encouraging words mean the world to me.", "WORDS"),
  it("WA3", "A heartfelt compliment can make my whole day.", "WORDS"),
  it("QT1", "I feel closest to people when we share focused, uninterrupted time.", "TIME"),
  it("QT2", "Undivided attention means more to me than almost anything.", "TIME"),
  it("QT3", "I'd rather have a long, present conversation than receive a gift.", "TIME"),
  it("AS1", "I feel loved when someone helps me with tasks or chores.", "SERVICE"),
  it("AS2", "Actions speak louder than words — doing things for me shows love.", "SERVICE"),
  it("AS3", "When someone lightens my load, I feel truly cared for.", "SERVICE"),
  it("RG1", "A thoughtful gift makes me feel remembered and loved.", "GIFTS"),
  it("RG2", "I treasure meaningful gifts and keepsakes.", "GIFTS"),
  it("RG3", "Receiving a small surprise present really touches me.", "GIFTS"),
  it("PT1", "A hug or a hand to hold makes me feel deeply connected.", "TOUCH"),
  it("PT2", "I feel most loved through warm, affectionate touch.", "TOUCH"),
  it("PT3", "An embrace communicates love to me better than words.", "TOUCH"),
];

const META: Record<string, { name: string; summary: string }> = {
  WORDS: { name: "Words of Affirmation", summary: "You feel most loved through spoken and written appreciation — compliments, encouragement, and 'I love you.'" },
  TIME: { name: "Quality Time", summary: "You feel most loved through focused, undivided attention and shared presence." },
  SERVICE: { name: "Acts of Service", summary: "You feel most loved when people do helpful things for you — actions over words." },
  GIFTS: { name: "Receiving Gifts", summary: "You feel most loved through thoughtful, meaningful gifts that say 'I was thinking of you.'" },
  TOUCH: { name: "Physical Touch", summary: "You feel most loved through affectionate physical closeness — hugs, hand-holding, and warmth." },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const arr = Object.keys(META).map((id) => ({ id, mean: s[id].mean }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const second = sorted[1];
  const meta = META[top.id];
  const confidence = Math.max(0.2, Math.min(0.98, 0.5 + (top.mean - second.mean)));
  return {
    code: meta.name,
    title: `Primary: ${meta.name}`,
    summary: meta.summary,
    components: [
      { label: "Primary language", value: meta.name },
      { label: "Secondary language", value: META[second.id].name },
      { label: "Full ranking", value: sorted.map((x) => META[x.id].name.split(" ")[0]).join(" › ") },
      { label: "Tip", value: `Ask loved ones for more ${meta.name.toLowerCase()}, and learn to 'speak' theirs too.` },
    ],
    confidence,
    secondary: META[second.id].name,
  };
}

export const loveLanguages: Instrument = {
  id: "love-languages",
  name: "Love Languages",
  shortName: "Love Languages",
  kind: "typological",
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

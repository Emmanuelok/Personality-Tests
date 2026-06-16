import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { selfCompassionTypeStrings, type SelfCompassionTypeBundle } from "./i18n";

/**
 * Self-Compassion (Neff) — how you treat yourself when you struggle, fail, or
 * fall short. Kristin Neff's model has three pairs, each a warmer pole and its
 * harsher opposite: Self-Kindness vs. Self-Judgment, Common Humanity vs.
 * Isolation, and Mindfulness vs. Over-Identification. Higher self-compassion
 * predicts lower anxiety and depression, more resilience, and steadier
 * motivation. Items are ORIGINAL to this platform, grounded in the Self-
 * Compassion Scale (SCS) tradition. Self-compassion is a trainable skill — a
 * snapshot of how you relate to yourself right now, not a fixed trait.
 */

const L = { min: 1, max: 5, labels: ["Almost never", "Rarely", "Sometimes", "Often", "Almost always"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Self-Kindness — warmth and understanding toward yourself in difficulty
  it("SK1", "When I'm going through a hard time, I treat myself with care and tenderness.", "SK"),
  it("SK2", "I try to be understanding and patient toward the parts of myself I don't like.", "SK"),
  it("SK3", "When I'm hurting, I give myself the kindness I'd offer a good friend.", "SK"),
  it("SK4", "I'm gentle with myself when I'm struggling or in pain.", "SK"),
  // Self-Judgment — a harsh, critical stance toward yourself
  it("SJ1", "I'm disapproving and judgmental about my own flaws and shortcomings.", "SJ"),
  it("SJ2", "When I fail at something that matters, I'm hard on myself.", "SJ"),
  it("SJ3", "I can be cold and harsh toward myself when I'm suffering.", "SJ"),
  it("SJ4", "I'm impatient and intolerant toward the parts of myself I dislike.", "SJ"),
  // Common Humanity — seeing your struggles as part of the shared human experience
  it("CH1", "When things go badly, I remind myself that setbacks are part of being human.", "CH"),
  it("CH2", "I see my difficulties as something most people go through, not just me.", "CH"),
  it("CH3", "When I feel inadequate, I remember that many other people feel this way too.", "CH"),
  it("CH4", "I try to see my failures as part of the common human experience.", "CH"),
  // Isolation — feeling cut off and alone in your suffering
  it("IS1", "When I'm really down, I feel like most other people are probably happier than me.", "IS"),
  it("IS2", "When I fail at something, I feel alone and set apart in my failure.", "IS"),
  it("IS3", "When I'm struggling, I tend to feel that others have it easier than I do.", "IS"),
  it("IS4", "My hard times make me feel separated and cut off from other people.", "IS"),
  // Mindfulness — balanced, clear awareness of painful thoughts and feelings
  it("MI1", "When something painful happens, I try to take a balanced view of the situation.", "MI"),
  it("MI2", "When I feel bad, I try to observe my emotions with openness and clarity.", "MI"),
  it("MI3", "I can hold a difficult feeling in awareness without being overwhelmed by it.", "MI"),
  it("MI4", "When I'm upset, I keep some perspective instead of getting lost in it.", "MI"),
  // Over-Identification — being swept up and carried away by painful emotions
  it("OI1", "When I fail at something, I get consumed by feelings of inadequacy.", "OI"),
  it("OI2", "When something upsets me, I get carried away by my feelings.", "OI"),
  it("OI3", "When I'm down, I tend to fixate and obsess over everything that's wrong.", "OI"),
  it("OI4", "Painful feelings tend to sweep me up and take over.", "OI"),
];

/** Canonical, language-agnostic band codes. */
const CODE: Record<string, string> = { warm: "Self-Compassionate", growing: "Growing Self-Compassion", harsh: "Self-Critical" };

/** English default; es/fr live in core/instruments/i18n.ts (selfCompassionTypeStrings). */
const SCS_TYPE_EN: SelfCompassionTypeBundle = {
  bands: {
    warm: { title: "A Warm Inner Voice", summary: "You meet your own struggles with real kindness — treating yourself as you would a good friend, remembering you're not alone, and holding hard feelings without drowning in them. This inner warmth is one of the strongest buffers there is against anxiety, burnout, and harsh self-criticism." },
    growing: { title: "Building Self-Kindness", summary: "You can be kind to yourself, but a critical voice still gets the floor when things go wrong. You're somewhere in the middle — which is where most people are. Strengthening your warmer facet and softening the harsher one is the fastest route to steadier wellbeing." },
    harsh: { title: "A Harsh Inner Critic", summary: "When you struggle or fall short, you tend to turn on yourself — with judgment, a sense of being alone in it, or feelings that take over. That inner critic is exhausting, and it rarely helps you do better. The good news: self-compassion is a learnable skill, and small shifts here pay off quickly." },
  },
  labels: { overall: "Overall self-compassion", strength: "Greatest strength", growth: "Growth lever", critic: "Loudest inner critic" },
  facets: { SK: "Self-Kindness", SJ: "Self-Judgment", CH: "Common Humanity", IS: "Isolation", MI: "Mindfulness", OI: "Over-Identification" },
};

/** The six facets; the three "warmer" ones, and their three harsher opposites. */
type FacetId = "SK" | "SJ" | "CH" | "IS" | "MI" | "OI";
const FACETS: FacetId[] = ["SK", "SJ", "CH", "IS", "MI", "OI"];
const HARSHER: FacetId[] = ["SJ", "IS", "OI"];
const POSITIVE = new Set<FacetId>(["SK", "CH", "MI"]);

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = selfCompassionTypeStrings(locale) ?? SCS_TYPE_EN;
  // Orient every facet so higher = more self-compassionate (reverse the harsher three).
  const oriented = {} as Record<FacetId, number>;
  for (const id of FACETS) {
    oriented[id] = POSITIVE.has(id) ? s[id].normalized : 100 - s[id].normalized;
  }
  const composite = Math.round(FACETS.reduce((a, id) => a + oriented[id], 0) / 6);
  const band = composite >= 66 ? "warm" : composite >= 42 ? "growing" : "harsh";
  const meta = T.bands[band];

  // Greatest strength = highest oriented facet; growth lever = lowest.
  const byOriented = [...FACETS].sort((a, b) => oriented[b] - oriented[a]);
  const strengthId = byOriented[0];
  const growthId = byOriented[byOriented.length - 1];
  // Loudest inner critic = the harsher facet (raw) that's most active.
  const criticId = [...HARSHER].sort((a, b) => s[b].normalized - s[a].normalized)[0];

  return {
    code: CODE[band],
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.overall, value: `${composite}/100`, detail: meta.title },
      { label: T.labels.strength, value: T.facets[strengthId], detail: `${Math.round(oriented[strengthId])}/100` },
      { label: T.labels.growth, value: T.facets[growthId], detail: `${Math.round(oriented[growthId])}/100` },
      { label: T.labels.critic, value: T.facets[criticId], detail: `${Math.round(s[criticId].normalized)}/100` },
    ],
    confidence: Math.max(0.2, Math.min(0.95, Math.abs(composite - 50) / 50 + 0.45)),
    secondary: T.facets[growthId],
  };
}

export const selfCompassion: Instrument = {
  id: "self-compassion-scs",
  name: "Self-Compassion",
  shortName: "Self-Compassion",
  kind: "typological",
  category: "wellbeing",
  tagline: "How kindly — or how harshly — you treat yourself when life gets hard.",
  description:
    "Self-compassion is how you relate to yourself in moments of struggle, failure, or pain. Kristin Neff's model " +
    "maps three pairs: Self-Kindness vs. Self-Judgment (warmth vs. harshness), Common Humanity vs. Isolation " +
    "(\"everyone struggles\" vs. \"only me\"), and Mindfulness vs. Over-Identification (balanced awareness vs. being " +
    "swept away). Higher self-compassion is one of the best-evidenced buffers against anxiety and burnout — and, " +
    "unlike self-esteem, it doesn't depend on succeeding or comparing well. This profiler shows where your inner " +
    "voice is warm, where it's harsh, and the facet where kindness grows fastest.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Self-Compassion Scale (SCS) tradition.",
  scales: [
    { id: "SK", name: "Self-Kindness", description: "Meeting your own pain with warmth and understanding.", highDescriptor: "gentle and supportive toward yourself when you struggle", lowDescriptor: "rarely offering yourself warmth in hard moments", poles: { low: "Withholding", high: "Kind" }, normMean: 3.0, normSd: 0.78 },
    { id: "SJ", name: "Self-Judgment", description: "Being harsh, critical, and disapproving of yourself.", highDescriptor: "quick to criticize and condemn your own flaws", lowDescriptor: "able to accept your flaws without harshness", poles: { low: "Accepting", high: "Self-critical" }, normMean: 3.0, normSd: 0.82 },
    { id: "CH", name: "Common Humanity", description: "Seeing your struggles as part of the shared human experience.", highDescriptor: "aware that everyone struggles, so you don't feel singled out", lowDescriptor: "prone to feeling your difficulties are yours alone", poles: { low: "Alone", high: "Connected" }, normMean: 3.1, normSd: 0.74 },
    { id: "IS", name: "Isolation", description: "Feeling cut off and alone when you suffer.", highDescriptor: "feeling separate and alone in your struggles", lowDescriptor: "feeling connected to others even in hard times", poles: { low: "Connected", high: "Isolated" }, normMean: 3.0, normSd: 0.84 },
    { id: "MI", name: "Mindfulness", description: "Holding painful feelings in balanced, clear awareness.", highDescriptor: "able to face hard feelings with perspective and openness", lowDescriptor: "more likely to avoid or be overtaken by hard feelings", poles: { low: "Overtaken", high: "Balanced" }, normMean: 3.2, normSd: 0.72 },
    { id: "OI", name: "Over-Identification", description: "Being swept up and carried away by painful emotions.", highDescriptor: "getting consumed and carried away by what's wrong", lowDescriptor: "able to feel pain without being engulfed by it", poles: { low: "Steady", high: "Swept away" }, normMean: 3.1, normSd: 0.8 },
  ],
  items,
  resolveType,
  caveats: [
    "Self-compassion is a skill, not a fixed trait — it reliably grows with practice. A low score is a starting line, not a verdict.",
    "Self-compassion is not self-pity, self-indulgence, or letting yourself off the hook; research links it to MORE personal responsibility and motivation, not less.",
    "This is an educational self-reflection. If self-criticism is severe or tied to low mood, talking with a therapist can help — compassion-focused approaches are well-supported.",
  ],
  citations: [
    { ref: "Neff, K. D. (2003). The development and validation of a scale to measure self-compassion. Self and Identity, 2(3), 223–250." },
    { ref: "Neff, K. D. (2003). Self-compassion: An alternative conceptualization of a healthy attitude toward oneself. Self and Identity, 2(2), 85–101." },
    { ref: "MacBeth, A., & Gumley, A. (2012). Exploring compassion: A meta-analysis of the association between self-compassion and psychopathology. Clinical Psychology Review, 32(6), 545–552." },
  ],
};

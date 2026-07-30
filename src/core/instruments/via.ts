import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { viaTypeStrings, type ViaTypeBundle } from "./i18n";

/**
 * VIA Character Strengths — the full 24 strengths within six virtues.
 *
 * The VIA Classification (Peterson & Seligman, 2004) is the most researched
 * framework in positive psychology. This profiler measures all 24 strengths and
 * surfaces your "signature strengths" — the ones most core to who you are. Using
 * your signature strengths in new ways is among the most validated routes to
 * lasting wellbeing. Items are ORIGINAL to this platform; the VIA-IS is not used.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "A little", "Somewhat", "Mostly like me", "Very much like me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // — Wisdom & Knowledge —
  it("CREAT1", "I often come up with new and original ways to do things.", "CREAT"),
  it("CREAT2", "People see me as imaginative and inventive.", "CREAT"),
  it("CURIO1", "I'm curious about almost everything and love to explore.", "CURIO"),
  it("CURIO2", "I'm always asking questions and seeking out new experiences.", "CURIO"),
  it("JUDGE1", "I think things through and weigh the evidence before I decide.", "JUDGE"),
  it("JUDGE2", "I'm willing to change my mind when the facts call for it.", "JUDGE"),
  it("LEARN1", "I love mastering new skills and topics for their own sake.", "LEARN"),
  it("LEARN2", "Learning something new gives me a genuine thrill.", "LEARN"),
  it("PERSP1", "People come to me for wise advice and perspective.", "PERSP"),
  it("PERSP2", "I can see the big picture and help others make sense of things.", "PERSP"),
  // — Courage —
  it("BRAVE1", "I stand up for what's right, even when it's hard or risky.", "BRAVE"),
  it("BRAVE2", "I don't shrink from challenges, threats, or pain.", "BRAVE"),
  it("PERSV1", "I finish what I start, even when it gets tough.", "PERSV"),
  it("PERSV2", "I work hard and don't give up easily.", "PERSV"),
  it("HONES1", "I'm honest and present myself genuinely to others.", "HONES"),
  it("HONES2", "I take responsibility for my actions and my feelings.", "HONES"),
  it("ZEST1", "I approach life with excitement and energy.", "ZEST"),
  it("ZEST2", "I feel alive, vital, and enthusiastic most of the time.", "ZEST"),
  // — Humanity —
  it("LOVE1", "I value close, loving relationships and nurture them.", "LOVE"),
  it("LOVE2", "I'm comfortable both giving and receiving love and care.", "LOVE"),
  it("KIND1", "I go out of my way to help and be generous to others.", "KIND"),
  it("KIND2", "Doing kind things for people genuinely lifts me.", "KIND"),
  it("SOCIN1", "I'm good at sensing what others feel and what makes them tick.", "SOCIN"),
  it("SOCIN2", "I know how to make people feel comfortable and understood.", "SOCIN"),
  // — Justice —
  it("TEAM1", "I'm a loyal, dependable member of any team I'm on.", "TEAM"),
  it("TEAM2", "I do my share and work well toward shared goals.", "TEAM"),
  it("FAIR1", "I treat all people fairly and give everyone a fair chance.", "FAIR"),
  it("FAIR2", "I don't let my feelings bias how I judge or treat others.", "FAIR"),
  it("LEAD1", "I'm good at organizing people and getting things done as a group.", "LEAD"),
  it("LEAD2", "People naturally look to me to take the lead.", "LEAD"),
  // — Temperance —
  it("FORGV1", "I forgive those who've wronged me and let go of grudges.", "FORGV"),
  it("FORGV2", "I readily give people a second chance.", "FORGV"),
  it("HUMIL1", "I let my accomplishments speak for themselves rather than seeking the spotlight.", "HUMIL"),
  it("HUMIL2", "I don't think of myself as more special than other people.", "HUMIL"),
  it("PRUD1", "I'm careful and avoid doing things I might later regret.", "PRUD"),
  it("PRUD2", "I think before I act and steer clear of unnecessary risks.", "PRUD"),
  it("SELFR1", "I have good control over my emotions and impulses.", "SELFR"),
  it("SELFR2", "I'm disciplined about my habits and routines.", "SELFR"),
  // — Transcendence —
  it("BEAUT1", "I'm often moved by beauty in nature, art, or skilled performance.", "BEAUT"),
  it("BEAUT2", "I notice and appreciate excellence across many areas of life.", "BEAUT"),
  it("GRAT1", "I feel and express gratitude for the good things in my life.", "GRAT"),
  it("GRAT2", "I regularly take time to count my blessings.", "GRAT"),
  it("HOPE1", "I expect the best and work to make it happen.", "HOPE"),
  it("HOPE2", "I stay optimistic about the future, even in hard times.", "HOPE"),
  it("HUMOR1", "I love to laugh and bring lightness and play to situations.", "HUMOR"),
  it("HUMOR2", "I use humor to connect with people and lift the mood.", "HUMOR"),
  it("SPIRIT1", "I have a clear sense of purpose and meaning in my life.", "SPIRIT"),
  it("SPIRIT2", "I feel connected to something larger than myself.", "SPIRIT"),
];

const STRENGTH_NAMES: Record<string, string> = {
  CREAT: "Creativity", CURIO: "Curiosity", JUDGE: "Judgment", LEARN: "Love of Learning", PERSP: "Perspective",
  BRAVE: "Bravery", PERSV: "Perseverance", HONES: "Honesty", ZEST: "Zest",
  LOVE: "Love", KIND: "Kindness", SOCIN: "Social Intelligence",
  TEAM: "Teamwork", FAIR: "Fairness", LEAD: "Leadership",
  FORGV: "Forgiveness", HUMIL: "Humility", PRUD: "Prudence", SELFR: "Self-Regulation",
  BEAUT: "Appreciation of Beauty", GRAT: "Gratitude", HOPE: "Hope", HUMOR: "Humor", SPIRIT: "Spirituality",
};
const VIRTUE_OF: Record<string, string> = {
  CREAT: "Wisdom", CURIO: "Wisdom", JUDGE: "Wisdom", LEARN: "Wisdom", PERSP: "Wisdom",
  BRAVE: "Courage", PERSV: "Courage", HONES: "Courage", ZEST: "Courage",
  LOVE: "Humanity", KIND: "Humanity", SOCIN: "Humanity",
  TEAM: "Justice", FAIR: "Justice", LEAD: "Justice",
  FORGV: "Temperance", HUMIL: "Temperance", PRUD: "Temperance", SELFR: "Temperance",
  BEAUT: "Transcendence", GRAT: "Transcendence", HOPE: "Transcendence", HUMOR: "Transcendence", SPIRIT: "Transcendence",
};

/** English default; es/fr live in core/instruments/i18n.ts (viaTypeStrings).
 *  Strength names (used as the canonical code) and English virtue keys stay stable. */
const VIA_TYPE_EN: ViaTypeBundle = {
  names: STRENGTH_NAMES,
  virtues: { Wisdom: "Wisdom", Courage: "Courage", Humanity: "Humanity", Justice: "Justice", Temperance: "Temperance", Transcendence: "Transcendence" },
  labels: { top: "#1 strength", signature: "Signature strengths", virtue: "Leading virtue", use: "Use it well" },
  signaturePrefix: "Signature strength: ",
  summary: (n) => `Your signature strengths are ${n.join(", ")}. Using these in fresh ways is one of the surest paths to a fuller life.`,
  useTip: (name) => `Find one new way to use your ${name} this week.`,
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = viaTypeStrings(locale) ?? VIA_TYPE_EN;
  const ranked = Object.keys(STRENGTH_NAMES)
    .map((id) => ({ id, mean: s[id]?.mean ?? 0 }))
    .sort((a, b) => b.mean - a.mean);
  const top5 = ranked.slice(0, 5);

  const virtueScore: Record<string, { sum: number; n: number }> = {};
  for (const id of Object.keys(STRENGTH_NAMES)) {
    const v = VIRTUE_OF[id];
    (virtueScore[v] ??= { sum: 0, n: 0 });
    virtueScore[v].sum += s[id]?.mean ?? 0;
    virtueScore[v].n += 1;
  }
  const dominantVirtue = Object.entries(virtueScore).sort((a, b) => b[1].sum / b[1].n - a[1].sum / a[1].n)[0][0];

  const sep = top5[0].mean - (ranked[5]?.mean ?? top5[0].mean);
  const top5Names = top5.map((x) => T.names[x.id]);
  return {
    code: STRENGTH_NAMES[top5[0].id],
    title: `${T.signaturePrefix}${T.names[top5[0].id]}`,
    summary: T.summary(top5Names),
    components: [
      { label: T.labels.top, value: T.names[top5[0].id], detail: T.virtues[VIRTUE_OF[top5[0].id]] },
      { label: T.labels.signature, value: top5Names.join(" · ") },
      { label: T.labels.virtue, value: T.virtues[dominantVirtue] },
      { label: T.labels.use, value: T.useTip(T.names[top5[0].id].toLowerCase()) },
    ],
    confidence: Math.max(0.3, Math.min(0.97, 0.5 + sep)),
    secondary: STRENGTH_NAMES[top5[1].id],
  };
}

const DESC: Record<string, string> = {
  CREAT: "inventive and original", CURIO: "curious and exploratory", JUDGE: "open-minded and discerning", LEARN: "eager to learn and master", PERSP: "wise and perspective-giving",
  BRAVE: "brave and principled", PERSV: "persistent and hard-working", HONES: "honest and authentic", ZEST: "energetic and full of zest",
  LOVE: "warm and loving", KIND: "kind and generous", SOCIN: "socially perceptive and attuned",
  TEAM: "loyal and team-minded", FAIR: "fair and even-handed", LEAD: "a natural organizer and leader",
  FORGV: "forgiving and merciful", HUMIL: "humble and modest", PRUD: "careful and prudent", SELFR: "self-disciplined and composed",
  BEAUT: "moved by beauty and excellence", GRAT: "grateful and appreciative", HOPE: "hopeful and optimistic", HUMOR: "playful and good-humored", SPIRIT: "purpose-driven and connected to meaning",
};

const scaleDefs = Object.entries(STRENGTH_NAMES).map(([id, name]) => ({
  id,
  name,
  description: `${VIRTUE_OF[id]} — your ${name.toLowerCase()}.`,
  highDescriptor: DESC[id],
  lowDescriptor: `quieter here than in your signature strengths`,
  normMean: 3.5,
  normSd: 0.78,
}));

export const via: Instrument = {
  id: "via-24",
  name: "Character Strengths (VIA-24)",
  shortName: "Strengths",
  kind: "typological",
  category: "strengths",
  tagline: "Discover your signature strengths — the very best of who you are.",
  description:
    "The VIA Classification identifies 24 character strengths grouped under six universal virtues. This " +
    "profiler measures all 24 and reveals your top 'signature strengths' — the ones that feel most essentially " +
    "you. Decades of research show that using your signature strengths in new ways reliably boosts wellbeing.",
  estMinutes: 8,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the VIA Classification (Peterson & Seligman, 2004). The VIA-IS is not used.",
  scales: scaleDefs,
  items,
  resolveType,
  caveats: [
    "There are no weaknesses here — only strengths you use more or less. Your top five are your 'signature.'",
    "Growth means using your signature strengths in new contexts, not fixing 'low' ones.",
    "A brief screen of all 24 strengths, not the full VIA-IS.",
  ],
  citations: [
    { ref: "Peterson, C., & Seligman, M. E. P. (2004). Character Strengths and Virtues: A Handbook and Classification. Oxford University Press / APA." },
    { ref: "Niemiec, R. M. (2018). Character Strengths Interventions: A Field Guide for Practitioners. Hogrefe." },
    { ref: "Seligman, M. E. P., Steen, T. A., Park, N., & Peterson, C. (2005). Positive psychology progress. American Psychologist, 60(5), 410–421." },
  ],
};

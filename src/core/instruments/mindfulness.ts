import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { mindfulnessTypeStrings, type MindfulnessTypeBundle } from "./i18n";

/**
 * Five Facet Mindfulness (Baer et al.) — dispositional mindfulness isn't one
 * thing. The FFMQ resolves it into five facets: Observing (noticing inner and
 * outer experience), Describing (putting it into words), Acting with Awareness
 * (being present vs. on autopilot), Non-judging (a non-evaluative stance toward
 * your inner life), and Non-reactivity (letting thoughts and feelings come and
 * go without being swept up). Items are ORIGINAL to this platform, grounded in
 * the FFMQ tradition; some are reverse-keyed (the autopilot and judging items),
 * so a higher facet score always means "more mindful." Educational reflection.
 */

const L = { min: 1, max: 5, labels: ["Never true", "Rarely true", "Sometimes true", "Often true", "Always true"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Observing — noticing internal and external experience
  it("OB1", "I notice the smells and aromas of things.", "OBS"),
  it("OB2", "I pay attention to physical sensations — the wind in my hair, the sun on my face.", "OBS"),
  it("OB3", "I notice how food and drink affect my thoughts, body, and mood.", "OBS"),
  it("OB4", "I notice visual details in art or nature — colors, shapes, and light.", "OBS"),
  // Describing — labeling inner experience with words
  it("DE1", "I'm good at finding words to describe my feelings.", "DES"),
  it("DE2", "I can usually put my beliefs and expectations into words.", "DES"),
  it("DE3", "Even when I feel terribly upset, I can find a way to put it into words.", "DES"),
  it("DE4", "I can easily describe, in detail, what I'm thinking.", "DES"),
  // Acting with Awareness — present vs. on autopilot (reverse-keyed)
  it("AW1", "I rush through activities without being really attentive to them.", "AWA", -1),
  it("AW2", "I do jobs or tasks automatically, without being aware of what I'm doing.", "AWA", -1),
  it("AW3", "I find myself doing things without paying attention.", "AWA", -1),
  it("AW4", "I get so caught up in thoughts about the past or future that I miss the present.", "AWA", -1),
  // Non-judging of inner experience — a non-evaluative stance (reverse-keyed)
  it("NJ1", "I criticize myself for having irrational or inappropriate emotions.", "NJ", -1),
  it("NJ2", "I tell myself I shouldn't be feeling the way I'm feeling.", "NJ", -1),
  it("NJ3", "I think some of my feelings are bad or wrong and I shouldn't have them.", "NJ", -1),
  it("NJ4", "I make harsh judgments about whether my thoughts are good or bad.", "NJ", -1),
  // Non-reactivity to inner experience — letting it come and go
  it("NR1", "I watch my feelings without getting carried away by them.", "NR"),
  it("NR2", "When I have distressing thoughts, I can just notice them without reacting.", "NR"),
  it("NR3", "In difficult moments, I can pause before I respond.", "NR"),
  it("NR4", "I can observe unpleasant thoughts and feelings and let them pass.", "NR"),
];

/** Canonical, language-agnostic band codes. */
const CODE: Record<string, string> = { mindful: "Highly Mindful", growing: "Growing Mindfulness", autopilot: "Often on Autopilot" };

/** The five facet ids, in report order. */
type FacetId = "OBS" | "DES" | "AWA" | "NJ" | "NR";
const FACETS: FacetId[] = ["OBS", "DES", "AWA", "NJ", "NR"];

/** English default; es/fr live in core/instruments/i18n.ts (mindfulnessTypeStrings). */
const MINDFUL_TYPE_EN: MindfulnessTypeBundle = {
  bands: {
    mindful: { title: "The Present", summary: "You meet life with a good deal of present-moment awareness — noticing what's here, naming it, staying with your activities, and letting thoughts and feelings pass without being swept up. This mindful stance is one of the best-evidenced supports for calm, focus, and emotional balance. Keep it alive with small, regular practice." },
    growing: { title: "The Steadying", summary: "You're mindful in some moments and on autopilot in others — which is where most people live. Some facets come easily; others slip when you're busy or stressed. Strengthening your weakest facet with a little daily practice is the fastest way to steadier attention and calmer reactions." },
    autopilot: { title: "On Autopilot", summary: "A lot of life is running on autopilot right now — attention scattered, the inner critic loud, or feelings that sweep you up quickly. That's extremely common and very workable: mindfulness is a trainable skill, and even a few minutes a day of present-moment practice reliably builds it. Your weakest facet is the place to start." },
  },
  labels: { overall: "Overall mindfulness", strength: "Strongest facet", growth: "Growth lever", everyday: "Everyday presence" },
  facets: { OBS: "Observing", DES: "Describing", AWA: "Acting with Awareness", NJ: "Non-judging", NR: "Non-reactivity" },
  levels: { high: "strong", mid: "moderate", low: "developing" },
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = mindfulnessTypeStrings(locale) ?? MINDFUL_TYPE_EN;
  const overall = Math.round(FACETS.reduce((a, id) => a + s[id].normalized, 0) / FACETS.length);
  const band = overall >= 66 ? "mindful" : overall >= 42 ? "growing" : "autopilot";
  const meta = T.bands[band];
  const ranked = [...FACETS].sort((a, b) => s[b].normalized - s[a].normalized);
  const strengthId = ranked[0];
  const growthId = ranked[ranked.length - 1];
  const awa = s.AWA.normalized;
  const lvl = (n: number) => (n >= 66 ? T.levels.high : n >= 40 ? T.levels.mid : T.levels.low);
  return {
    code: CODE[band],
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.overall, value: `${overall}/100`, detail: meta.title },
      { label: T.labels.strength, value: T.facets[strengthId], detail: `${Math.round(s[strengthId].normalized)}/100` },
      { label: T.labels.growth, value: T.facets[growthId], detail: `${Math.round(s[growthId].normalized)}/100` },
      { label: T.labels.everyday, value: lvl(awa), detail: `${Math.round(awa)}/100 — ${T.facets.AWA}` },
    ],
    confidence: Math.max(0.2, Math.min(0.95, Math.abs(overall - 50) / 50 + 0.45)),
    secondary: T.facets[growthId],
  };
}

export const mindfulness: Instrument = {
  id: "mindfulness-ffmq",
  name: "Five Facet Mindfulness",
  shortName: "Mindfulness",
  kind: "typological",
  category: "wellbeing",
  tagline: "Present-moment awareness, across its five distinct facets.",
  description:
    "Mindfulness — paying attention to the present, on purpose, without judgment — is not a single trait. This " +
    "profiler, grounded in the Five Facet Mindfulness Questionnaire, maps five: Observing (noticing inner and outer " +
    "experience), Describing (putting it into words), Acting with Awareness (being present rather than on autopilot), " +
    "Non-judging (a kind, non-evaluative stance toward your inner life), and Non-reactivity (letting thoughts and " +
    "feelings come and go). It shows where your attention is strong, where it scatters, and the facet where practice " +
    "pays off fastest. Mindfulness is trainable — this is a starting line, not a verdict.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Five Facet Mindfulness Questionnaire (FFMQ) tradition.",
  scales: [
    { id: "OBS", name: "Observing", description: "Noticing and attending to internal and external experiences.", highDescriptor: "attuned to sensations, sights, sounds, and inner signals", lowDescriptor: "less tuned in to moment-to-moment experience", poles: { low: "Tuned out", high: "Attuned" }, normMean: 3.3, normSd: 0.8 },
    { id: "DES", name: "Describing", description: "Putting inner experiences into words.", highDescriptor: "able to name and articulate what you think and feel", lowDescriptor: "finding feelings hard to put into words", poles: { low: "Wordless", high: "Articulate" }, normMean: 3.3, normSd: 0.82 },
    { id: "AWA", name: "Acting with Awareness", description: "Being present in your activities rather than on autopilot.", highDescriptor: "present and attentive in what you're doing", lowDescriptor: "often running on autopilot, attention elsewhere", poles: { low: "Autopilot", high: "Present" }, normMean: 3.2, normSd: 0.82 },
    { id: "NJ", name: "Non-judging", description: "Taking a non-evaluative stance toward thoughts and feelings.", highDescriptor: "accepting of your inner experience without harsh judgment", lowDescriptor: "quick to judge your own thoughts and feelings", poles: { low: "Judging", high: "Accepting" }, normMean: 3.2, normSd: 0.86 },
    { id: "NR", name: "Non-reactivity", description: "Letting thoughts and feelings come and go without being swept up.", highDescriptor: "able to notice hard feelings without being carried away", lowDescriptor: "easily caught up and swept along by inner experience", poles: { low: "Swept up", high: "Steady" }, normMean: 3.0, normSd: 0.78 },
  ],
  items,
  resolveType,
  caveats: [
    "Mindfulness is a trainable skill — every facet grows with practice. A low score is a starting line, not a fixed trait.",
    "The Observing facet is the one exception to 'higher is always better': without the others, simply noticing more can amplify rumination. It's most helpful paired with non-judging and non-reactivity.",
    "This is an educational self-reflection, not a clinical or meditation-attainment measure.",
  ],
  citations: [
    { ref: "Baer, R. A., Smith, G. T., Hopkins, J., Krietemeyer, J., & Toney, L. (2006). Using self-report assessment methods to explore facets of mindfulness. Assessment, 13(1), 27–45." },
    { ref: "Brown, K. W., & Ryan, R. M. (2003). The benefits of being present: Mindfulness and its role in psychological well-being. Journal of Personality and Social Psychology, 84(4), 822–848." },
    { ref: "Baer, R. A., et al. (2008). Construct validity of the Five Facet Mindfulness Questionnaire in meditating and nonmeditating samples. Assessment, 15(3), 329–342." },
  ],
};

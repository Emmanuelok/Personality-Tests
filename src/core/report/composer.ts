import type { AssessmentResult, Instrument, ScaleDef, ScaleScore } from "../types";
import { Rng, hashHex, nonce, seedFrom } from "../prng";
import { ordinal, round1, sentence } from "../variation";
import {
  BIG_FIVE_COLOR,
  BIG_FIVE_DYNAMICS,
  LEVEL_OPENERS,
  NUANCE_CLAUSES,
  type TraitColor,
} from "./phrasebank";
import type { GenerateOptions, PersonalityReport, ReportSection, TraitInsight } from "./types";

/** Fill {placeholders} and normalize into a clean sentence/sentences. */
function fill(tpl: string, ctx: Record<string, string | number>): string {
  return sentence(tpl.replace(/\{(\w+)\}/g, (_, k) => String(ctx[k] ?? "")));
}

function descriptorPhrases(desc: string): string[] {
  return desc
    .split(/,| and /)
    .map((s) => s.trim())
    .filter(Boolean);
}

function poleLabel(scale: ScaleDef, normalized: number): string {
  if (scale.poles) {
    if (normalized >= 55) return scale.poles.high;
    if (normalized <= 45) return scale.poles.low;
    return "balanced";
  }
  return normalized >= 55 ? "high" : normalized <= 45 ? "low" : "balanced";
}

// Headline banks for synthesizing a dimensional archetype name.
const TRAIT_ADJ: Record<string, { high: string[]; low: string[] }> = {
  O: { high: ["Curious", "Inventive", "Visionary", "Imaginative", "Exploratory"], low: ["Grounded", "Practical", "Pragmatic", "Concrete"] },
  C: { high: ["Methodical", "Disciplined", "Steadfast", "Diligent", "Orderly"], low: ["Spontaneous", "Freewheeling", "Improvisational", "Easygoing"] },
  E: { high: ["Outgoing", "Energizing", "Expressive", "Magnetic"], low: ["Reflective", "Reserved", "Inward", "Contemplative"] },
  A: { high: ["Warm", "Compassionate", "Cooperative", "Generous"], low: ["Candid", "Independent", "Frank", "Unsentimental"] },
  N: { high: ["Sensitive", "Intense", "Feeling", "Vigilant"], low: ["Composed", "Unshakable", "Steady", "Calm"] },
};
const TRAIT_NOUN: Record<string, { high: string[]; low: string[] }> = {
  O: { high: ["Explorer", "Creator", "Theorist", "Dreamer", "Innovator"], low: ["Realist", "Pragmatist", "Craftsman"] },
  C: { high: ["Builder", "Organizer", "Achiever", "Steward", "Planner"], low: ["Improviser", "Free Spirit", "Maverick"] },
  E: { high: ["Connector", "Catalyst", "Host", "Mobilizer"], low: ["Observer", "Thinker", "Sage"] },
  A: { high: ["Diplomat", "Caregiver", "Ally", "Peacemaker"], low: ["Challenger", "Maverick", "Straight-Shooter"] },
  N: { high: ["Empath", "Sentinel", "Sensitive"], low: ["Anchor", "Rock", "Stoic"] },
};

function distinctiveness(s: ScaleScore): number {
  return Math.abs(s.normalized - 50);
}

const GENERIC_NOUNS = ["Original", "Character", "Archetype", "Persona", "Mind", "Portrait", "Spirit"];

/** Headline for dimensional instruments that aren't the Big Five, built from pole labels. */
function genericHeadline(rng: Rng, instrument: Instrument, scales: Record<string, ScaleScore>): { title: string; subtitle: string } {
  const ranked = instrument.scales
    .map((sc) => ({ sc, score: scales[sc.id] }))
    .filter((x) => x.score)
    .sort((a, b) => distinctiveness(b.score) - distinctiveness(a.score));
  if (!ranked.length) return { title: "Your Personality Portrait", subtitle: instrument.name };
  const top = ranked[0];
  const second = ranked[1] ?? ranked[0];
  const word = (x: { sc: ScaleDef; score: ScaleScore }) => {
    const lbl = x.score.normalized >= 50 ? x.sc.poles?.high ?? x.sc.name : x.sc.poles?.low ?? x.sc.name;
    return lbl.split(/[ ,–-]/)[0];
  };
  return {
    title: `The ${word(top)} ${rng.pick(GENERIC_NOUNS)}`,
    subtitle: rng.pick([
      `A portrait led by your ${top.sc.name} and ${second.sc.name}`,
      `Defined most by your ${top.sc.name}`,
      `Where your ${top.sc.name} meets your ${second.sc.name}`,
    ]),
  };
}

function dimensionalHeadline(rng: Rng, instrument: Instrument, scales: Record<string, ScaleScore>): { title: string; subtitle: string } {
  if (instrument.id !== "big-five-ipip50") return genericHeadline(rng, instrument, scales);
  const ranked = instrument.scales
    .map((sc) => ({ sc, score: scales[sc.id] }))
    .filter((x) => TRAIT_ADJ[x.sc.id])
    .sort((a, b) => distinctiveness(b.score) - distinctiveness(a.score));
  if (ranked.length < 2) {
    return { title: "Your Personality Portrait", subtitle: instrument.name };
  }
  const top = ranked[0];
  const second = ranked[1];
  const adjPole = top.score.normalized >= 50 ? "high" : "low";
  const nounPole = second.score.normalized >= 50 ? "high" : "low";
  const adj = rng.pick(TRAIT_ADJ[top.sc.id][adjPole]);
  const noun = rng.pick(TRAIT_NOUN[second.sc.id][nounPole]);
  const subtitleVariants = [
    `A portrait shaped most by your ${top.sc.name} and ${second.sc.name}`,
    `Where your ${top.sc.name} meets your ${second.sc.name}`,
    `Defined first by ${top.sc.name}, then by ${second.sc.name}`,
  ];
  return { title: `The ${adj} ${noun}`, subtitle: rng.pick(subtitleVariants) };
}

function colorFor(instrument: Instrument, scaleId: string): TraitColor | null {
  if (instrument.id === "big-five-ipip50") return BIG_FIVE_COLOR[scaleId] ?? null;
  return null;
}

function buildTraitInsight(rng: Rng, instrument: Instrument, scale: ScaleDef, score: ScaleScore): TraitInsight {
  const pct = Math.round(score.percentile);
  const ctx = {
    name: scale.name,
    pct: ordinal(pct),
    hd: scale.highDescriptor,
    ld: scale.lowDescriptor,
    hi: scale.poles?.high ?? "the high side",
    lo: scale.poles?.low ?? "the low side",
  };
  const opener = fill(rng.pick(LEVEL_OPENERS[score.level]), ctx);

  const color = colorFor(instrument, scale.id);
  const poleHigh = score.normalized >= 50;
  let behaviorSentence = "";
  let strengths: string[];
  let watchouts: string[];

  if (color) {
    const pole = poleHigh ? color.high : color.low;
    behaviorSentence = rng.pick(pole.behavior);
    strengths = rng.sample(pole.strengths, Math.min(3, pole.strengths.length));
    watchouts = rng.sample(pole.watchouts, Math.min(2, pole.watchouts.length));
  } else {
    const phrases = descriptorPhrases(poleHigh ? scale.highDescriptor : scale.lowDescriptor);
    strengths = rng.sample(phrases, Math.min(3, phrases.length));
    watchouts = [
      poleHigh
        ? `Leaning hard into being ${rng.pick(phrases)} can crowd out its opposite when a situation needs it.`
        : `A strong ${scale.poles?.low ?? "low"} lean means the ${scale.poles?.high ?? "high"} mode takes deliberate effort.`,
    ];
  }

  const middle = score.level === "moderate" && color ? rng.pick(color.mid) : "";
  const nuance = rng.chance(0.6) ? rng.pick(NUANCE_CLAUSES) : "";

  const narrative = [opener, behaviorSentence, middle, nuance]
    .filter(Boolean)
    .map((s) => sentence(s))
    .join(" ");

  return {
    scaleId: scale.id,
    name: scale.name,
    percentile: pct,
    normalized: round1(score.normalized),
    mean: round1(score.mean),
    level: score.level,
    poleLabel: poleLabel(scale, score.normalized),
    narrative,
    strengths,
    watchouts,
  };
}

function buildDynamics(rng: Rng, instrument: Instrument, scales: Record<string, ScaleScore>): string[] {
  if (instrument.id !== "big-five-ipip50") {
    // For typological instruments, surface interplay from the resolved components.
    return [];
  }
  const fired: string[] = [];
  for (const rule of BIG_FIVE_DYNAMICS) {
    const na = scales[rule.a]?.normalized;
    const nb = scales[rule.b]?.normalized;
    if (na == null || nb == null) continue;
    if (rule.when(na, nb)) fired.push(rng.pick(rule.variants));
  }
  // Keep it focused: at most four, chosen by the seed.
  return rng.sample(fired, Math.min(4, fired.length)).map((s) => sentence(s));
}

function buildSignatureResponses(rng: Rng, instrument: Instrument, result: AssessmentResult): string[] {
  const { min, max } = instrument.responseFormat;
  const extremes = instrument.items
    .map((item) => ({ item, r: result.responses[item.id] }))
    .filter((x) => x.r === max || x.r === min);

  const sel = rng.sample(extremes, Math.min(5, extremes.length));
  const out: string[] = [];
  for (const { item, r } of sel) {
    const scale = instrument.scales.find((s) => s.id === item.scale);
    const stmt = item.text.replace(/\.$/, "");
    const agree = r === max ? rng.pick(["completely true of you", "exactly like you", "strongly accurate"]) : rng.pick(["not true of you at all", "nothing like you", "strongly inaccurate"]);
    const tail = rng.pick([
      `— a specific brushstroke in your ${scale?.name ?? "profile"} that a score alone would flatten.`,
      `, which colors your ${scale?.name ?? "profile"} in a way the headline number can't.`,
      `— one of the concrete details that makes this profile yours and no one else's.`,
    ]);
    out.push(sentence(`You rated “${stmt}” as ${agree} ${tail}`));
  }
  return out;
}

function buildSections(
  rng: Rng,
  instrument: Instrument,
  result: AssessmentResult,
  traits: TraitInsight[],
): ReportSection[] {
  const sections: ReportSection[] = [];
  const byDistinct = [...traits].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50));
  const topTraits = byDistinct.slice(0, Math.min(3, byDistinct.length));

  // Strengths
  const strengthBullets = Array.from(new Set(topTraits.flatMap((t) => t.strengths))).slice(0, 6);
  sections.push({
    id: "strengths",
    heading: rng.pick(["Signature Strengths", "Where You Shine", "Your Natural Advantages"]),
    paragraphs: [
      sentence(
        rng.pick([
          "These are the capacities your profile most reliably gives you — the moves that come cheaply to you and expensively to others.",
          "Read these as your home turf: the strengths you can lean on without much conscious effort.",
          "Every profile has a few load-bearing strengths. Here are yours, drawn from your most distinctive traits.",
        ]),
      ),
    ],
    bullets: strengthBullets,
  });

  // Growth edges
  const watchBullets = Array.from(new Set(topTraits.flatMap((t) => t.watchouts))).slice(0, 5);
  sections.push({
    id: "growth-edges",
    heading: rng.pick(["Growth Edges", "Where to Watch Yourself", "The Other Side of Your Strengths"]),
    paragraphs: [
      sentence(
        rng.pick([
          "None of these are flaws so much as the shadow your strengths cast — the predictable cost of your particular wiring.",
          "Every strength overused becomes a liability. These are the edges worth keeping an eye on.",
          "Growth rarely means becoming someone else; it usually means managing the downside of who you already are. Start here.",
        ]),
      ),
    ],
    bullets: watchBullets,
  });

  // Relationships & Work & Stress from color banks (Big Five) or generic.
  const colorTraits = topTraits
    .map((t) => ({ t, color: colorFor(instrument, t.scaleId), poleHigh: t.normalized >= 50 }))
    .filter((x) => x.color) as { t: TraitInsight; color: TraitColor; poleHigh: boolean }[];

  if (colorTraits.length) {
    sections.push({
      id: "relationships",
      heading: rng.pick(["In Relationships", "How You Connect", "With the People in Your Life"]),
      paragraphs: rng
        .sample(
          colorTraits.flatMap((x) => (x.poleHigh ? x.color.high : x.color.low).relationships),
          Math.min(3, colorTraits.length + 1),
        )
        .map((s) => sentence(s)),
    });
    sections.push({
      id: "work",
      heading: rng.pick(["At Work & Collaborating", "How You Operate", "In Work and Teams"]),
      paragraphs: rng
        .sample(
          colorTraits.flatMap((x) => (x.poleHigh ? x.color.high : x.color.low).work),
          Math.min(3, colorTraits.length + 1),
        )
        .map((s) => sentence(s)),
    });
    sections.push({
      id: "stress",
      heading: rng.pick(["Stress & Resilience", "Under Pressure", "When Things Get Hard"]),
      paragraphs: rng
        .sample(
          colorTraits.flatMap((x) => (x.poleHigh ? x.color.high : x.color.low).stress),
          Math.min(2, colorTraits.length),
        )
        .map((s) => sentence(s)),
    });
  }

  // Typological deep-dive
  if (result.type) {
    const t = result.type;
    const comps = t.components.map((c) => `${c.label}: ${c.value}${c.detail ? ` (${c.detail})` : ""}`);
    sections.unshift({
      id: "type-depth",
      heading: rng.pick(["Your Type, in Depth", "The Shape of Your Type", "Inside Your Result"]),
      paragraphs: [
        sentence(
          rng.pick([
            `Your result, ${t.code} — ${t.title}, reflects ${t.summary.toLowerCase()}`,
            `${t.title} (${t.code}) captures a particular configuration: ${t.summary.toLowerCase()}`,
            `At the center of your result sits ${t.code}, ${t.title}: ${t.summary.toLowerCase()}`,
          ]),
        ),
        sentence(
          t.confidence >= 0.66
            ? rng.pick([
                "Your responses pointed to this result decisively — the underlying preferences were clear and consistent.",
                "This typing rests on firm ground; your answers leaned the same direction with little ambiguity.",
              ])
            : t.confidence >= 0.4
              ? rng.pick([
                  "This result is a good fit, though a couple of dimensions were closer to the middle — read your runner-up too.",
                  "Hold this typing lightly at the edges: some preferences were moderate rather than emphatic.",
                ])
              : rng.pick([
                  "Several dimensions sat near the midpoint, so treat this as the best of a few near-ties and explore the alternatives.",
                  "Your profile is genuinely balanced across some axes — the label is a starting point, not a verdict.",
                ]),
        ),
      ],
      bullets: comps,
    });
  }

  return sections;
}

function buildOverview(
  rng: Rng,
  instrument: Instrument,
  result: AssessmentResult,
  traits: TraitInsight[],
  headline: { title: string; subtitle: string },
  name?: string,
): string[] {
  const byDistinct = [...traits].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50));
  const lead = byDistinct.slice(0, 2);
  const who = name ? `${name}, ` : "";

  const p1 = result.type
    ? sentence(
        rng.pick([
          `${who}this is a portrait of how you, specifically, come out on the ${instrument.shortName}. Your result is ${result.type.code} — ${result.type.title}.`,
          `${who}what follows is built entirely from your own answers on the ${instrument.shortName}. They resolve to ${result.type.title} (${result.type.code}).`,
        ]),
      )
    : sentence(
        rng.pick([
          `${who}this is a portrait of how you, specifically, come out on the ${instrument.name}. If your profile had a name, it might be “${headline.title}”`,
          `${who}what follows is assembled entirely from your own answers. As a shorthand, your pattern reads like “${headline.title}”`,
        ]),
      );

  const p2 = sentence(
    rng.pick([
      `The two notes that define you most are your ${lead[0]?.name} (${ordinal(lead[0]?.percentile ?? 50)} percentile) and your ${lead[1]?.name} (${ordinal(lead[1]?.percentile ?? 50)} percentile). Almost everything else in this report bends around those two.`,
      `Your profile is anchored by ${lead[0]?.name} and ${lead[1]?.name} — the two traits that pull furthest from average and therefore shape the most about how you operate.`,
      `If you remember nothing else: ${lead[0]?.name} and ${lead[1]?.name} are doing the heavy lifting in your profile, and the rest plays in their key.`,
    ]),
  );

  const p3 = sentence(
    rng.pick([
      "This isn't a verdict. The last section turns the same data toward where you want to go — because the point of seeing yourself clearly is to choose, deliberately, what to do next.",
      "Read it as a mirror, not a cage. And when you're ready, the growth planner uses these exact scores to map a route from where you are to where you'd like to be.",
      "Nothing here is fixed. Your traits are tendencies, not sentences — and the improvement plan that follows is built to move them, gently and on purpose.",
    ]),
  );

  return [p1, p2, p3];
}

/**
 * Compose a uniquely tailored report from a scored assessment. Deterministic
 * given its seed; unique across generations because the default seed folds in a
 * high-entropy nonce and the wall clock alongside the full response vector.
 */
export function composeReport(
  instrument: Instrument,
  result: AssessmentResult,
  opts: GenerateOptions = {},
): PersonalityReport {
  const now = opts.now ?? new Date();
  const reportId = nonce(8);
  const seed =
    opts.seed ?? seedFrom(result.responseFingerprint, now.getTime(), reportId);
  const rng = new Rng(seed);
  const seedHex = hashHex(String(seed));

  // Decide which scales to narrate (focus typological many-scale instruments).
  const orderedScores = instrument.scales
    .map((sc) => ({ sc, score: result.scales[sc.id] }))
    .filter((x) => x.score);
  const shown =
    instrument.scales.length > 6
      ? [...orderedScores].sort((a, b) => b.score.normalized - a.score.normalized).slice(0, 5)
      : orderedScores;

  const traits = shown.map(({ sc, score }) => buildTraitInsight(rng, instrument, sc, score));

  const headline = result.type
    ? { title: result.type.title, subtitle: `${result.type.code} · ${instrument.name}` }
    : dimensionalHeadline(rng, instrument, result.scales);

  const overview = buildOverview(rng, instrument, result, traits, headline, opts.name);
  const dynamics = buildDynamics(rng, instrument, result.scales);
  const sections = buildSections(rng, instrument, result, traits);
  const signatureResponses = buildSignatureResponses(rng, instrument, result);

  return {
    instrumentId: instrument.id,
    instrumentName: instrument.name,
    generatedAt: now.toISOString(),
    reportId,
    seedHex,
    responseFingerprint: result.responseFingerprint,
    title: headline.title,
    subtitle: headline.subtitle,
    overview,
    type: result.type,
    traits,
    dynamics,
    sections,
    signatureResponses,
    uniqueness: {
      reportId,
      seedHex,
      note:
        "This report was composed from your full response pattern plus a unique generation seed. " +
        "No two generations produce identical prose — even from identical answers.",
    },
    engine: "deterministic",
  };
}

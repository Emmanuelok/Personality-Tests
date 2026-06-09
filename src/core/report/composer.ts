import type { AssessmentResult, Instrument, ScaleDef, ScaleScore } from "../types";
import { Rng, hashHex, nonce, seedFrom } from "../prng";
import { round1, sentence, tidy } from "../variation";
import { type TraitColor } from "./phrasebank";
import { reportStrings, type ReportStrings } from "./i18n";
import type { GenerateOptions, PersonalityReport, ReportSection, TraitInsight } from "./types";

/** Fill {placeholders} and normalize into a clean sentence/sentences. */
function fill(tpl: string, ctx: Record<string, string | number>): string {
  return sentence(tpl.replace(/\{(\w+)\}/g, (_, k) => String(ctx[k] ?? "")));
}

/** Fill {placeholders} without forcing terminal punctuation — for titles/subtitles. */
function tmpl(t: string, ctx: Record<string, string | number>): string {
  return tidy(t.replace(/\{(\w+)\}/g, (_, k) => String(ctx[k] ?? "")));
}

function descriptorPhrases(desc: string): string[] {
  return desc
    .split(/,| and | y | et /)
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

// Headline banks for synthesizing a dimensional archetype name (Big Five only; English).
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

/** Headline for dimensional instruments that aren't the Big Five, built from pole labels. */
function genericHeadline(rng: Rng, loc: ReportStrings, instrument: Instrument, scales: Record<string, ScaleScore>): { title: string; subtitle: string } {
  const ranked = instrument.scales
    .map((sc) => ({ sc, score: scales[sc.id] }))
    .filter((x) => x.score)
    .sort((a, b) => distinctiveness(b.score) - distinctiveness(a.score));
  if (!ranked.length) return { title: loc.portraitTitle, subtitle: loc.portraitSub(instrument.name) };
  const top = ranked[0];
  const second = ranked[1] ?? ranked[0];
  return {
    title: tmpl(loc.genericTitle, { top: top.sc.name }),
    subtitle: tmpl(rng.pick(loc.genericSubtitle), { top: top.sc.name, second: second.sc.name }),
  };
}

function dimensionalHeadline(rng: Rng, loc: ReportStrings, instrument: Instrument, scales: Record<string, ScaleScore>): { title: string; subtitle: string } {
  if (instrument.id !== "big-five-ipip50") return genericHeadline(rng, loc, instrument, scales);
  const ranked = instrument.scales
    .map((sc) => ({ sc, score: scales[sc.id] }))
    .filter((x) => TRAIT_ADJ[x.sc.id])
    .sort((a, b) => distinctiveness(b.score) - distinctiveness(a.score));
  if (ranked.length < 2) {
    return { title: loc.portraitTitle, subtitle: loc.portraitSub(instrument.name) };
  }
  const top = ranked[0];
  const second = ranked[1];
  const adjPole = top.score.normalized >= 50 ? "high" : "low";
  const nounPole = second.score.normalized >= 50 ? "high" : "low";
  const adj = rng.pick(TRAIT_ADJ[top.sc.id][adjPole]);
  const noun = rng.pick(TRAIT_NOUN[second.sc.id][nounPole]);
  // Big Five keeps its English adjective/noun title (paired with the English color bank);
  // the subtitle is localized since it leans on the (translated) scale names.
  return { title: `The ${adj} ${noun}`, subtitle: tmpl(rng.pick(loc.genericSubtitle), { top: top.sc.name, second: second.sc.name }) };
}

function colorFor(loc: ReportStrings, instrument: Instrument, scaleId: string): TraitColor | null {
  if (instrument.id === "big-five-ipip50") return loc.color[scaleId] ?? null;
  return null;
}

function buildTraitInsight(rng: Rng, loc: ReportStrings, instrument: Instrument, scale: ScaleDef, score: ScaleScore): TraitInsight {
  const pct = Math.round(score.percentile);
  const ctx = {
    name: scale.name,
    pct: loc.pct(pct),
    hd: scale.highDescriptor,
    ld: scale.lowDescriptor,
    hi: scale.poles?.high ?? "the high side",
    lo: scale.poles?.low ?? "the low side",
  };
  const opener = fill(rng.pick(loc.openers[score.level]), ctx);

  const color = colorFor(loc, instrument, scale.id);
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
        ? fill(loc.fallbackWatchHigh, { x: rng.pick(phrases) })
        : fill(loc.fallbackWatchLow, { lo: scale.poles?.low ?? "low", hi: scale.poles?.high ?? "high" }),
    ];
  }

  const middle = score.level === "moderate" && color ? rng.pick(color.mid) : "";
  const nuance = rng.chance(0.6) ? rng.pick(loc.nuance) : "";

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

function buildDynamics(rng: Rng, loc: ReportStrings, instrument: Instrument, scales: Record<string, ScaleScore>): string[] {
  // Big-Five-specific concrete dynamics (English; paired with the English color bank).
  if (instrument.id !== "big-five-ipip50") return [];
  const fired: string[] = [];
  for (const rule of loc.dynamics) {
    const na = scales[rule.a]?.normalized;
    const nb = scales[rule.b]?.normalized;
    if (na == null || nb == null) continue;
    if (rule.when(na, nb)) fired.push(rng.pick(rule.variants));
  }
  return rng.sample(fired, Math.min(4, fired.length)).map((s) => sentence(s));
}

function buildSignatureResponses(rng: Rng, loc: ReportStrings, instrument: Instrument, result: AssessmentResult): string[] {
  const { min, max } = instrument.responseFormat;
  const extremes = instrument.items
    .map((item) => ({ item, r: result.responses[item.id] }))
    .filter((x) => x.r === max || x.r === min);

  const sel = rng.sample(extremes, Math.min(5, extremes.length));
  const out: string[] = [];
  for (const { item, r } of sel) {
    const scale = instrument.scales.find((s) => s.id === item.scale);
    const stmt = item.text.replace(/\.$/, "");
    const agree = r === max ? rng.pick(loc.sigAgreeMax) : rng.pick(loc.sigAgreeMin);
    const tail = fill(rng.pick(loc.sigTail), { trait: scale?.name ?? "" }).replace(/\.$/, "");
    out.push(fill(loc.sigTemplate, { stmt, agree, tail }));
  }
  return out;
}

/** Trait-derived Relationships / Work / Stress sections for instruments without
 *  a hand-written color bank, so every report goes beyond a bare trait list. */
function genericLifeSections(rng: Rng, loc: ReportStrings, instrument: Instrument, topTraits: TraitInsight[]): ReportSection[] {
  const sb = new Map(instrument.scales.map((s) => [s.id, s]));
  const d = (t: TraitInsight) => {
    const sd = sb.get(t.scaleId);
    const desc = t.normalized >= 50 ? sd?.highDescriptor : sd?.lowDescriptor;
    return descriptorPhrases(desc ?? t.poleLabel)[0] ?? t.poleLabel;
  };
  const rel = topTraits.slice(0, 2).map((t) => fill(rng.pick(loc.rel), { trait: t.name.toLowerCase(), d: d(t) }));
  const work = topTraits.slice(0, 2).map((t) => fill(rng.pick(loc.work), { trait: t.name.toLowerCase(), d: d(t) }));
  const stress = topTraits.slice(0, 1).map((t) => fill(rng.pick(loc.stress), { trait: t.name.toLowerCase(), d: d(t) }));
  return [
    { id: "relationships", heading: rng.pick(loc.relHead), paragraphs: rel },
    { id: "work", heading: rng.pick(loc.workHead), paragraphs: work },
    { id: "stress", heading: rng.pick(loc.stressHead), paragraphs: stress },
  ];
}

function buildSections(
  rng: Rng,
  loc: ReportStrings,
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
    heading: rng.pick(loc.strengthsHead),
    paragraphs: [sentence(rng.pick(loc.strengthsIntro))],
    bullets: strengthBullets,
  });

  // Growth edges
  const watchBullets = Array.from(new Set(topTraits.flatMap((t) => t.watchouts))).slice(0, 5);
  sections.push({
    id: "growth-edges",
    heading: rng.pick(loc.growthHead),
    paragraphs: [sentence(rng.pick(loc.growthIntro))],
    bullets: watchBullets,
  });

  // Relationships & Work & Stress from color banks (Big Five) or generic.
  const colorTraits = topTraits
    .map((t) => ({ t, color: colorFor(loc, instrument, t.scaleId), poleHigh: t.normalized >= 50 }))
    .filter((x) => x.color) as { t: TraitInsight; color: TraitColor; poleHigh: boolean }[];

  if (colorTraits.length) {
    // Big Five only — these concrete paragraphs (and their headings) remain English.
    sections.push({
      id: "relationships",
      heading: rng.pick(["In Relationships", "How You Connect", "With the People in Your Life"]),
      paragraphs: rng
        .sample(colorTraits.flatMap((x) => (x.poleHigh ? x.color.high : x.color.low).relationships), Math.min(3, colorTraits.length + 1))
        .map((s) => sentence(s)),
    });
    sections.push({
      id: "work",
      heading: rng.pick(["At Work & Collaborating", "How You Operate", "In Work and Teams"]),
      paragraphs: rng
        .sample(colorTraits.flatMap((x) => (x.poleHigh ? x.color.high : x.color.low).work), Math.min(3, colorTraits.length + 1))
        .map((s) => sentence(s)),
    });
    sections.push({
      id: "stress",
      heading: rng.pick(["Stress & Resilience", "Under Pressure", "When Things Get Hard"]),
      paragraphs: rng
        .sample(colorTraits.flatMap((x) => (x.poleHigh ? x.color.high : x.color.low).stress), Math.min(2, colorTraits.length))
        .map((s) => sentence(s)),
    });
  } else {
    for (const sec of genericLifeSections(rng, loc, instrument, topTraits)) sections.push(sec);
  }

  // Typological deep-dive
  if (result.type) {
    const t = result.type;
    const comps = t.components.map((c) => `${c.label}: ${c.value}${c.detail ? ` (${c.detail})` : ""}`);
    sections.unshift({
      id: "type-depth",
      heading: rng.pick(loc.typeDepthHead),
      paragraphs: [
        fill(rng.pick(loc.typeOpener), { code: t.code, title: t.title, summary: t.summary.toLowerCase() }),
        sentence(
          t.confidence >= 0.66 ? rng.pick(loc.confHigh) : t.confidence >= 0.4 ? rng.pick(loc.confMid) : rng.pick(loc.confLow),
        ),
      ],
      bullets: comps,
    });
  }

  return sections;
}

function buildOverview(
  rng: Rng,
  loc: ReportStrings,
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
    ? fill(rng.pick(loc.ovP1Type), { who, short: instrument.shortName, code: result.type.code, title: result.type.title })
    : fill(rng.pick(loc.ovP1Dim), { who, name: instrument.name, title: headline.title });

  const p2 = fill(rng.pick(loc.ovP2), {
    n0: lead[0]?.name ?? "",
    p0: loc.pct(lead[0]?.percentile ?? 50),
    n1: lead[1]?.name ?? "",
    p1: loc.pct(lead[1]?.percentile ?? 50),
  });

  const p3 = sentence(rng.pick(loc.ovP3));

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
  const loc = reportStrings(opts.locale);

  // Decide which scales to narrate (focus typological many-scale instruments).
  const orderedScores = instrument.scales
    .map((sc) => ({ sc, score: result.scales[sc.id] }))
    .filter((x) => x.score);
  const shown =
    instrument.scales.length > 6
      ? [...orderedScores].sort((a, b) => b.score.normalized - a.score.normalized).slice(0, 5)
      : orderedScores;

  const traits = shown.map(({ sc, score }) => buildTraitInsight(rng, loc, instrument, sc, score));

  const headline = result.type
    ? { title: result.type.title, subtitle: `${result.type.code} · ${instrument.name}` }
    : dimensionalHeadline(rng, loc, instrument, result.scales);

  const overview = buildOverview(rng, loc, instrument, result, traits, headline, opts.name);
  const dynamics = buildDynamics(rng, loc, instrument, result.scales);
  const sections = buildSections(rng, loc, instrument, result, traits);
  const signatureResponses = buildSignatureResponses(rng, loc, instrument, result);

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
    uniqueness: { reportId, seedHex, note: loc.uniquenessNote },
    engine: "deterministic",
  };
}

import type { AssessmentResult, Instrument, TypeResolution } from "./types";
import type { PersonalityReport, ReportSection, TraitInsight } from "./report/types";
import type { IntegratedProfile } from "./synthesis";
import type { ConvergenceResult } from "./converge";
import { Rng, nonce, seedFrom } from "./prng";
import { sentence } from "./variation";
import { cLoc, cSuggest, hasIntent, pctPhrase, CT, type Loc } from "./companion.i18n";

/**
 * "Ask Atlas" — a conversational companion that answers questions about a
 * person's results in their own data's words. Deterministic and offline by
 * default (intent-matched against the structured report / integrated profile),
 * with an optional LLM upgrade. This is what makes the platform feel like it's
 * talking to you, about you.
 */

export interface KnowledgeScale {
  id: string;
  name: string;
  normalized: number;
  percentile: number;
  level: string;
  poleLow?: string;
  poleHigh?: string;
  narrative?: string;
  strengths?: string[];
  watchouts?: string[];
}

export interface CompanionKnowledge {
  kind: "report" | "integrated";
  name?: string;
  title: string;
  instrumentName?: string;
  overview: string[];
  type?: TypeResolution;
  scales: KnowledgeScale[];
  dynamics?: string[];
  sections?: ReportSection[];
  themes?: { name: string; narrative: string }[];
  strengths?: string[];
  growthEdges?: string[];
  operatingManual?: { label: string; text: string }[];
  convergence?: ConvergenceResult;
}

export function buildReportKnowledge(instrument: Instrument, result: AssessmentResult, report: PersonalityReport, name?: string): CompanionKnowledge {
  const byId = new Map<string, TraitInsight>(report.traits.map((t) => [t.scaleId, t]));
  const scales: KnowledgeScale[] = instrument.scales
    .filter((s) => result.scales[s.id])
    .map((s) => {
      const sc = result.scales[s.id];
      const ti = byId.get(s.id);
      return {
        id: s.id,
        name: s.name,
        normalized: sc.normalized,
        percentile: sc.percentile,
        level: sc.level,
        poleLow: s.poles?.low,
        poleHigh: s.poles?.high,
        narrative: ti?.narrative,
        strengths: ti?.strengths,
        watchouts: ti?.watchouts,
      };
    });
  return {
    kind: "report",
    name,
    title: report.title,
    instrumentName: instrument.name,
    overview: report.overview,
    type: report.type,
    scales,
    dynamics: report.dynamics,
    sections: report.sections,
  };
}

export function buildIntegratedKnowledge(ip: IntegratedProfile): CompanionKnowledge {
  return {
    kind: "integrated",
    name: ip.name,
    title: ip.headline,
    overview: ip.overview,
    scales: [],
    themes: ip.themes.map((t) => ({ name: t.name, narrative: t.narrative })),
    strengths: ip.strengths,
    growthEdges: ip.growthEdges,
    operatingManual: ip.operatingManual,
    convergence: ip.convergence,
    sections: [],
  };
}

export interface CompanionAnswer {
  text: string;
  followups: string[];
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));
const lower = (s: string) => s.toLowerCase();

export function suggestedQuestions(k: CompanionKnowledge, loc: string = "en"): string[] {
  const distinct = k.kind === "report" ? [...k.scales].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50))[0] : undefined;
  return cSuggest(k.kind, distinct?.name, cLoc(loc));
}

/** Strip a localized "Building your …" prefix from a growth-edge phrase. */
function stripBuilding(s: string, loc: Loc): string {
  const re = loc === "es" ? /^desarrollar (tu )?/ : loc === "fr" ? /^développer (votre )?/ : /^building (your )?/;
  return s.toLowerCase().replace(re, "");
}

function who(k: CompanionKnowledge): string {
  return k.name ? `${k.name}, ` : "";
}

function pickSection(k: CompanionKnowledge, ...ids: string[]): ReportSection | undefined {
  return k.sections?.find((s) => ids.includes(s.id));
}

/** Find a scale the question is asking about, by name keywords. */
function matchScale(k: CompanionKnowledge, q: string): KnowledgeScale | undefined {
  for (const s of k.scales) {
    const tokens = s.name.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length > 3);
    if (tokens.some((t) => q.includes(t))) return s;
  }
  // common synonyms
  if (has(q, "introvert", "extrovert", "extravert", "social")) return k.scales.find((s) => /extra|energy|social/i.test(s.name));
  if (has(q, "organi", "disciplin", "tidy")) return k.scales.find((s) => /conscien|disciplin|order/i.test(s.name));
  if (has(q, "anxious", "worry", "neurotic", "emotional")) return k.scales.find((s) => /neurotic|emotion|anxiety/i.test(s.name));
  return undefined;
}

export function askCompanion(k: CompanionKnowledge, question: string, seed?: number, loc: string = "en"): CompanionAnswer {
  const L = cLoc(loc);
  const rng = new Rng(seed ?? seedFrom("ask", question, nonce()));
  const q = question.toLowerCase().trim();
  const w = who(k);
  const followups = suggestedQuestions(k, L).filter((s) => s.toLowerCase() !== q).slice(0, 3);
  const wrap = (text: string): CompanionAnswer => ({ text: sentence(text), followups });

  if (!q || hasIntent(q, L, "greet")) {
    return wrap(CT.greet(CT.profileWord(k.kind === "integrated", L), w, L));
  }
  if (hasIntent(q, L, "thanks")) {
    return wrap(CT.thanks(k.name, L, rng.chance(0.5)));
  }

  // Trait lookup (report)
  const scale = k.kind === "report" ? matchScale(k, q) : undefined;
  if (scale && !hasIntent(q, L, "improve")) {
    const lead = scale.narrative ?? CT.traitLead(w, scale.name, pctPhrase(scale.percentile, L), scale.level, L);
    const extra = scale.strengths?.length ? CT.upside(scale.strengths.map(lower), L) : "";
    return wrap(lead + extra);
  }

  // Strengths
  if (hasIntent(q, L, "strengths")) {
    if (k.kind === "integrated" && k.strengths?.length) return wrap(CT.strengthsIntegrated(w, k.strengths.slice(0, 5).map(lower), L));
    const sec = pickSection(k, "strengths");
    const bullets = sec?.bullets?.length ? sec.bullets : topStrengths(k);
    return wrap(CT.strengthsReport(w, bullets.slice(0, 4).map(lower), L, rng.int(3)));
  }

  // Growth / improvement
  if (hasIntent(q, L, "improve")) {
    if (scale) {
      const watch = scale.watchouts?.length ? CT.watch(scale.watchouts.map(lower), L) : "";
      return wrap(CT.growthScale(w, scale.name, watch, L));
    }
    if (k.kind === "integrated" && k.growthEdges?.length) return wrap(CT.growthIntegrated(w, k.growthEdges.slice(0, 3).map((s) => stripBuilding(s, L)), L));
    const sec = pickSection(k, "growth-edges");
    const bullets = sec?.bullets?.length ? sec.bullets : ["the shadow side of your strongest traits"];
    return wrap(CT.growthReport(w, bullets.slice(0, 3).map(lower), L));
  }

  // Relationships / love
  if (hasIntent(q, L, "relationships")) {
    if (k.operatingManual) { const o = k.operatingManual.find((x) => /connect|conect|relie/i.test(x.label)); if (o) return wrap(o.text); }
    const sec = pickSection(k, "relationships");
    if (sec?.paragraphs?.length) return wrap(`${w}${rng.pick(sec.paragraphs)}`);
    return wrap(CT.relFallback(w, L));
  }

  // Work / career
  if (hasIntent(q, L, "work")) {
    if (k.operatingManual) { const o = k.operatingManual.find((x) => /work|trabaj|travail/i.test(x.label)); if (o) return wrap(o.text); }
    const sec = pickSection(k, "work");
    if (sec?.paragraphs?.length) return wrap(`${w}${rng.pick(sec.paragraphs)}`);
    return wrap(CT.workFallback(w, L));
  }

  // Stress
  if (hasIntent(q, L, "stress")) {
    if (k.operatingManual) { const o = k.operatingManual.find((x) => /stress|estr|gérer|gerer/i.test(x.label)); if (o) return wrap(o.text); }
    const sec = pickSection(k, "stress");
    if (sec?.paragraphs?.length) return wrap(`${w}${rng.pick(sec.paragraphs)}`);
    return wrap(CT.stressFallback(w, L));
  }

  // Consistency / cross-test convergence (integrated) — before "type" so
  // "my result(s) consistent?" isn't captured by the type intent's "my result".
  if (k.kind === "integrated" && hasIntent(q, L, "consistency")) {
    const cv = k.convergence;
    if (!cv || !cv.readings.length) return wrap(CT.consistencyNone(w, L));
    const conv = cv.topConvergent ? { name: cv.topConvergent.name, insight: cv.topConvergent.insight } : undefined;
    const div = cv.topDivergent ? { insight: cv.topDivergent.insight } : undefined;
    return wrap(CT.consistency(w, cv.readings.length, conv, div, L));
  }

  // Type / "what am I"
  if (hasIntent(q, L, "type")) {
    if (k.type) return wrap(CT.typeIs(w, k.type.code, k.type.title, k.type.summary, L));
    return wrap(CT.typeReads(w, k.title, k.overview[0] ?? "", L));
  }

  // Summary
  if (hasIntent(q, L, "summary")) {
    if (k.kind === "integrated") {
      const t = k.themes?.[0];
      return wrap(CT.summaryIntegrated(w, k.title, t ? t.narrative : k.overview[0] ?? "", L));
    }
    return wrap(`${w}${k.overview[0] ?? CT.summaryReportTitle(k.title, L)}${k.type ? CT.typeTail(k.type.code, k.type.title, L) : ""}`);
  }

  // Themes (integrated)
  if (k.kind === "integrated" && hasIntent(q, L, "themes")) {
    const lines = (k.themes ?? []).slice(0, 3).map((t) => `${t.name} — ${t.narrative}`);
    if (!lines.length) return wrap(CT.themesEmpty(L));
    return { text: sentence(CT.themesIntro(w, L)) + "\n\n• " + lines.join("\n\n• "), followups };
  }

  // Fallback — be useful, not blank.
  const hint = k.kind === "report" && k.scales.length
    ? CT.traitHint([...k.scales].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50))[0].name, L)
    : "";
  return wrap(CT.fallback(w, hint, L));
}

function topStrengths(k: CompanionKnowledge): string[] {
  return [...k.scales]
    .filter((s) => s.normalized >= 60 && s.strengths?.length)
    .flatMap((s) => s.strengths ?? [])
    .slice(0, 4);
}

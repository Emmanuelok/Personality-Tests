import type { AssessmentResult, Instrument, TypeResolution } from "./types";
import type { PersonalityReport, ReportSection, TraitInsight } from "./report/types";
import type { IntegratedProfile } from "./synthesis";
import { Rng, nonce, seedFrom } from "./prng";
import { oxford, sentence } from "./variation";

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
    sections: [],
  };
}

export interface CompanionAnswer {
  text: string;
  followups: string[];
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function suggestedQuestions(k: CompanionKnowledge): string[] {
  if (k.kind === "integrated") {
    return ["What are my biggest strengths?", "Where should I focus on growing?", "How do I work best?", "How do I handle stress?", "Sum me up in a sentence."];
  }
  const base = ["What does this mean for me?", "What are my strengths?", "What should I watch out for?", "How am I in relationships?", "How do I improve?"];
  const distinct = [...k.scales].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50))[0];
  if (distinct) base.splice(2, 0, `Tell me about my ${distinct.name}.`);
  return base.slice(0, 5);
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

export function askCompanion(k: CompanionKnowledge, question: string, seed?: number): CompanionAnswer {
  const rng = new Rng(seed ?? seedFrom("ask", question, nonce()));
  const q = question.toLowerCase().trim();
  const w = who(k);
  const followups = suggestedQuestions(k).filter((s) => s.toLowerCase() !== q).slice(0, 3);
  const wrap = (text: string): CompanionAnswer => ({ text: sentence(text), followups });

  if (!q || has(q, "hello", "hi ", "hey", "help", "what can you")) {
    return wrap(`${w}ask me anything about your ${k.kind === "integrated" ? "integrated profile" : "result"} — your strengths, your blind spots, how you show up in relationships or at work, or how to grow. Try one of the suggestions below.`);
  }
  if (has(q, "thank", "thanks", "appreciate")) {
    return wrap(rng.pick([`Anytime${k.name ? `, ${k.name}` : ""}. I'm here whenever you want to go deeper.`, `You're welcome${k.name ? `, ${k.name}` : ""}. Ask me anything else.`]));
  }

  // Trait lookup (report)
  const scale = k.kind === "report" ? matchScale(k, q) : undefined;
  if (scale && !has(q, "improve", "grow", "better", "work on")) {
    const lead = scale.narrative ?? `${w}your ${scale.name} sits at the ${ordinal(Math.round(scale.percentile))} percentile (${scale.level}).`;
    const extra = scale.strengths?.length ? ` On the upside: ${oxford(scale.strengths.map((s) => s.toLowerCase()))}.` : "";
    return wrap(lead + extra);
  }

  // Strengths
  if (has(q, "strength", "good at", "best", "superpower", "shine", "advantage")) {
    if (k.kind === "integrated" && k.strengths?.length) return wrap(`${w}across everything you've taken, your standout strengths are ${oxford(k.strengths.slice(0, 5).map((s) => s.toLowerCase()))}. Lean on these — they're your home turf.`);
    const sec = pickSection(k, "strengths");
    const bullets = sec?.bullets?.length ? sec.bullets : topStrengths(k);
    return wrap(`${w}your biggest strengths are ${oxford(bullets.slice(0, 4).map((s) => s.toLowerCase()))}. ${rng.pick(["These come cheaply to you and expensively to others.", "Build your life around these and you'll feel in your element.", "Use them on purpose, especially under pressure."])}`);
  }

  // Growth / improvement
  if (has(q, "improve", "grow", "better", "work on", "develop", "weak", "blind", "watch", "flaw")) {
    if (scale) {
      const watch = scale.watchouts?.length ? ` Watch for ${oxford(scale.watchouts.map((s) => s.toLowerCase()))}.` : "";
      return wrap(`${w}to grow your ${scale.name}: pick one small, repeated behavior that nudges it, do it daily, and review weekly — traits move with practice, not willpower.${watch} The Growth Plan in your report turns this into specific steps.`);
    }
    if (k.kind === "integrated" && k.growthEdges?.length) return wrap(`${w}your clearest growth frontier right now is ${oxford(k.growthEdges.slice(0, 3).map((s) => s.toLowerCase().replace(/^building (your )?/, "")))}. Growth isn't a leap — it's one deliberate behavior, repeated. Start with the single one that matters most this season.`);
    const sec = pickSection(k, "growth-edges");
    const bullets = sec?.bullets?.length ? sec.bullets : ["the shadow side of your strongest traits"];
    return wrap(`${w}your growth edges are ${oxford(bullets.slice(0, 3).map((s) => s.toLowerCase()))}. None are flaws — they're the cost of your particular wiring. Your report's Growth Plan maps concrete, evidence-based steps.`);
  }

  // Relationships / love
  if (has(q, "relationship", "partner", "love", "dating", "friend", "marriage", "romantic")) {
    if (k.operatingManual) { const o = k.operatingManual.find((x) => /connect/i.test(x.label)); if (o) return wrap(o.text); }
    const sec = pickSection(k, "relationships");
    if (sec?.paragraphs?.length) return wrap(`${w}${rng.pick(sec.paragraphs)}`);
    return wrap(`${w}your profile shapes how you bond — try the Compatibility tool to compare with someone, and see the "In Relationships" section of your report.`);
  }

  // Work / career
  if (has(q, "work", "career", "job", "team", "leader", "boss", "colleague", "profession", "manage")) {
    if (k.operatingManual) { const o = k.operatingManual.find((x) => /work/i.test(x.label)); if (o) return wrap(o.text); }
    const sec = pickSection(k, "work");
    if (sec?.paragraphs?.length) return wrap(`${w}${rng.pick(sec.paragraphs)}`);
    return wrap(`${w}your traits point to environments where you'll thrive — see the "At Work" section of your report for specifics.`);
  }

  // Stress
  if (has(q, "stress", "anxiety", "overwhelm", "cope", "pressure", "burnout", "calm down", "anxious")) {
    if (k.operatingManual) { const o = k.operatingManual.find((x) => /stress/i.test(x.label)); if (o) return wrap(o.text); }
    const sec = pickSection(k, "stress");
    if (sec?.paragraphs?.length) return wrap(`${w}${rng.pick(sec.paragraphs)}`);
    return wrap(`${w}under pressure, name the feeling, slow your breathing, and protect recovery before stress compounds — small resets beat big ones.`);
  }

  // Type / "what am I"
  if (has(q, "type", "what am i", "who am i", "my result", "code")) {
    if (k.type) return wrap(`${w}you came out as ${k.type.code} — ${k.type.title}. ${k.type.summary}`);
    return wrap(`${w}your profile reads as "${k.title}". ${k.overview[0] ?? ""}`);
  }

  // Summary
  if (has(q, "summary", "sum me", "tell me about", "describe me", "overview", "in a sentence", "tldr")) {
    if (k.kind === "integrated") {
      const t = k.themes?.[0];
      return wrap(`${w}in a sentence: you're "${k.title}". ${t ? t.narrative : k.overview[0] ?? ""}`);
    }
    return wrap(`${w}${k.overview[0] ?? `your result is "${k.title}".`}${k.type ? ` You're ${k.type.code} — ${k.type.title}.` : ""}`);
  }

  // Themes (integrated)
  if (k.kind === "integrated" && has(q, "theme", "thread", "pattern", "core")) {
    const lines = (k.themes ?? []).slice(0, 3).map((t) => `${t.name} — ${t.narrative}`);
    if (!lines.length) return wrap("Take a few more assessments and your recurring themes will emerge here.");
    return { text: sentence(`${w}the threads that keep surfacing across your assessments are:`) + "\n\n• " + lines.join("\n\n• "), followups };
  }

  // Fallback — be useful, not blank.
  return wrap(
    `${w}I can answer best about your strengths, growth edges, relationships, work style, stress, and what your result means. ${k.kind === "report" && k.scales.length ? `You can also ask about a specific trait, like "${[...k.scales].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50))[0].name}."` : ""} Try a suggestion below.`,
  );
}

function topStrengths(k: CompanionKnowledge): string[] {
  return [...k.scales]
    .filter((s) => s.normalized >= 60 && s.strengths?.length)
    .flatMap((s) => s.strengths ?? [])
    .slice(0, 4);
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

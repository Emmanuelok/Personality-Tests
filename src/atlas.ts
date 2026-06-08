import type { CompanionKnowledge } from "@core/companion";

/**
 * Try the optional server-side LLM ("Ask Atlas"). Returns the model's answer, or
 * null when unavailable (no API key, local dev without functions, or an error) —
 * in which case the caller falls back to the deterministic companion.
 */
export async function askAtlasRemote(knowledge: CompanionKnowledge, question: string): Promise<string | null> {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, knowledge: trim(knowledge) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.answer === "string" && data.answer.trim() ? data.answer.trim() : null;
  } catch {
    return null;
  }
}

/** Trim the knowledge payload to the essentials before sending. */
function trim(k: CompanionKnowledge) {
  return {
    kind: k.kind,
    name: k.name,
    title: k.title,
    instrumentName: k.instrumentName,
    type: k.type ? { code: k.type.code, title: k.type.title, summary: k.type.summary } : undefined,
    overview: k.overview,
    scales: k.scales.map((s) => ({ name: s.name, level: s.level, percentile: Math.round(s.percentile), low: s.poleLow, high: s.poleHigh })),
    dynamics: k.dynamics,
    themes: k.themes,
    strengths: k.strengths,
    growthEdges: k.growthEdges,
    operatingManual: k.operatingManual,
    sections: k.sections?.map((s) => ({ heading: s.heading, paragraphs: s.paragraphs })),
  };
}

import type { LLMProvider, PersonalityReport } from "./types";

/**
 * Optional AI narrative provider backed by the official Anthropic SDK.
 *
 * IMPORTANT — this is intended for SERVER-SIDE use. Calling Claude directly from
 * a browser would expose your API key, so this provider is wired through a
 * dynamic, optional import: it is never bundled into the client and only works
 * where `@anthropic-ai/sdk` is installed and an API key is available. The
 * deterministic composer remains the always-on default.
 *
 * The model is configurable (constructor arg or ANTHROPIC_MODEL); we deliberately
 * avoid hardcoding a specific model string. Point it at the latest Claude Opus for
 * the richest prose.
 */
export interface ClaudeProviderOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

function readEnv(key: string): string | undefined {
  const env = (globalThis as any)?.process?.env;
  return env ? env[key] : undefined;
}

export function createClaudeProvider(opts: ClaudeProviderOptions = {}): LLMProvider {
  const apiKey = opts.apiKey ?? readEnv("ANTHROPIC_API_KEY");
  const model = opts.model ?? readEnv("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
  const maxTokens = opts.maxTokens ?? 8000;

  return {
    name: `anthropic:${model}`,
    available() {
      return Boolean(apiKey);
    },
    async compose({ structured, instructions }) {
      if (!apiKey) throw new Error("No ANTHROPIC_API_KEY available for AI composition.");

      // Optional dependency resolved at runtime; not statically bundled.
      const sdkName = "@anthropic-ai/sdk";
      // @ts-ignore — optional peer dependency; install `@anthropic-ai/sdk` to enable AI mode.
      const mod = await import(/* @vite-ignore */ sdkName);
      const Anthropic = mod.default ?? mod.Anthropic;
      const client = new Anthropic({ apiKey });

      // Only the prose travels to the model; numbers/levels/type stay authoritative.
      const prose = {
        title: structured.title,
        subtitle: structured.subtitle,
        overview: structured.overview,
        traits: structured.traits.map((t) => ({ scaleId: t.scaleId, name: t.name, level: t.level, percentile: t.percentile, narrative: t.narrative })),
        dynamics: structured.dynamics,
        sections: structured.sections.map((s) => ({ id: s.id, heading: s.heading, paragraphs: s.paragraphs })),
        signatureResponses: structured.signatureResponses,
      };

      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        thinking: { type: "adaptive" },
        system: instructions,
        messages: [
          {
            role: "user",
            content:
              "Here is the structured report as JSON. Rewrite ONLY the prose string fields and return a single JSON object with the same shape " +
              "(keys: title, subtitle, overview[], traits[{scaleId, narrative}], dynamics[], sections[{id, paragraphs[]}], signatureResponses[]). " +
              "Do not include any text outside the JSON.\n\n" +
              JSON.stringify(prose),
          },
        ],
      });

      const text = (response.content ?? [])
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");

      return mergeProse(structured, text);
    },
  };
}

/** Defensively merge model-rewritten prose back into the structured report. */
function mergeProse(base: PersonalityReport, modelText: string): PersonalityReport {
  let parsed: any;
  try {
    const start = modelText.indexOf("{");
    const end = modelText.lastIndexOf("}");
    parsed = JSON.parse(modelText.slice(start, end + 1));
  } catch {
    return base; // Fall back to deterministic prose if the model didn't return clean JSON.
  }

  const out: PersonalityReport = { ...base };
  if (typeof parsed.title === "string") out.title = parsed.title;
  if (typeof parsed.subtitle === "string") out.subtitle = parsed.subtitle;
  if (Array.isArray(parsed.overview)) out.overview = parsed.overview.map(String);
  if (Array.isArray(parsed.dynamics)) out.dynamics = parsed.dynamics.map(String);
  if (Array.isArray(parsed.signatureResponses)) out.signatureResponses = parsed.signatureResponses.map(String);

  if (Array.isArray(parsed.traits)) {
    const byId = new Map(parsed.traits.map((t: any) => [t.scaleId, t.narrative]));
    out.traits = base.traits.map((t) => (byId.has(t.scaleId) ? { ...t, narrative: String(byId.get(t.scaleId)) } : t));
  }
  if (Array.isArray(parsed.sections)) {
    const byId = new Map(parsed.sections.map((s: any) => [s.id, s.paragraphs]));
    out.sections = base.sections.map((s) =>
      byId.has(s.id) && Array.isArray(byId.get(s.id)) ? { ...s, paragraphs: (byId.get(s.id) as any[]).map(String) } : s,
    );
  }
  return out;
}

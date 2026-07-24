import type { CompanionKnowledge } from "@core/companion";

export interface ExternalAtlasOptions {
  /** Must be set by a direct, informed user action for this request. */
  consented: true;
  locale: "en" | "es" | "fr";
  /** Only user-approved, actionable observations may leave the device. */
  actionableEvidence?: string[];
}

/**
 * Try the optional external-AI mode. The rich local knowledge object is accepted
 * for API compatibility but is intentionally never transmitted. Without explicit
 * per-request consent this function performs no network request.
 */
export async function askAtlasRemote(
  _knowledge: CompanionKnowledge,
  question: string,
  options?: ExternalAtlasOptions,
): Promise<string | null> {
  const cleanQuestion = question.trim().slice(0, 1_000);
  if (!options?.consented || !cleanQuestion) return null;
  const actionableEvidence = (options.actionableEvidence ?? [])
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().replace(/\s+/g, " ").slice(0, 240))
    .filter(Boolean)
    .slice(0, 12);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        question: cleanQuestion,
        locale: options.locale,
        consent: { externalAI: true },
        actionableEvidence,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { answer?: unknown };
    return typeof data.answer === "string" && data.answer.trim() ? data.answer.trim() : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

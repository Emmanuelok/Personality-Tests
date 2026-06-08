import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Optional LLM-backed "Ask Atlas". When ANTHROPIC_API_KEY is set, this answers a
 * user's question about themselves using their structured profile as ground
 * truth. Returns { devMode: true } when no key is configured so the client falls
 * back to the deterministic companion. The model is env-configurable.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(200).json({ devMode: true });
    return;
  }

  const { question, knowledge } = (req.body ?? {}) as { question?: string; knowledge?: unknown };
  if (!question || typeof question !== "string") {
    res.status(400).json({ error: "missing_question" });
    return;
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const client = new Anthropic({ apiKey });
  const system =
    "You are Atlas, the warm, sharp, encouraging companion inside Psyche Atlas, a personality platform. " +
    "Answer the user's question about THEMSELVES using ONLY the structured profile JSON provided as ground truth. " +
    "Be specific and concrete, kind but honest — never flattering, never horoscope-vague. Keep it to 2–5 sentences. " +
    "Address them by name if it's present. Never invent scores, traits, or facts that aren't in the data. " +
    "If the question isn't about them or their growth, gently steer back. Do not mention JSON or that you were given data.";

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 600,
      system,
      messages: [
        {
          role: "user",
          content: `Here is my profile data:\n${JSON.stringify(knowledge).slice(0, 14000)}\n\nMy question: ${question}`,
        },
      ],
    });
    const text = (msg.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();
    res.status(200).json({ answer: text });
  } catch (err: any) {
    res.status(500).json({ error: "llm_error", message: err?.message ?? "unknown" });
  }
}

import { bumpNorms, getNorms } from "./_kv";

/**
 * Anonymous score-distribution norms (opt-in calibration). No accounts, no PII —
 * only coarse 0–9 histogram buckets per instrument scale, so we can show "you
 * scored higher than X% of takers." No-ops gracefully when KV isn't configured.
 */
export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { instrumentId, buckets } = body;
      if (typeof instrumentId === "string" && buckets && typeof buckets === "object") {
        await bumpNorms(instrumentId, buckets as Record<string, number>);
      }
      res.status(200).json({ ok: true });
    } catch {
      res.status(200).json({ ok: false });
    }
    return;
  }
  if (req.method === "GET") {
    const instrumentId = String((req.query && req.query.instrumentId) || "");
    const norms = instrumentId ? await getNorms(instrumentId) : {};
    res.status(200).json({ instrumentId, norms });
    return;
  }
  res.status(405).json({ error: "method not allowed" });
}

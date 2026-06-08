// Optional persistence for entitlements via Vercel KV. Everything here no-ops
// gracefully when KV isn't installed/configured, so the app runs without it.

async function kvClient(): Promise<any | null> {
  if (!process.env.KV_REST_API_URL && !process.env.KV_URL) return null;
  try {
    // @ts-ignore — optional dependency; `npm i @vercel/kv` and set KV env vars to enable.
    const mod = await import("@vercel/kv");
    return mod.kv ?? null;
  } catch {
    return null;
  }
}

/** Record that a fingerprint has purchased a product (idempotent). */
export async function recordEntitlement(fingerprint: string, productId: string): Promise<void> {
  const kv = await kvClient();
  if (!kv) return;
  try {
    await kv.sadd(`ent:${fingerprint}`, productId);
    await kv.expire(`ent:${fingerprint}`, 60 * 60 * 24 * 365);
  } catch {
    /* ignore */
  }
}

/** Products a fingerprint has purchased. Empty when KV is unconfigured. */
export async function getEntitlements(fingerprint: string): Promise<string[]> {
  const kv = await kvClient();
  if (!kv) return [];
  try {
    return ((await kv.smembers(`ent:${fingerprint}`)) as string[]) ?? [];
  } catch {
    return [];
  }
}

/* ── Anonymous score-distribution norms (opt-in calibration) ─────────────── */

/** Increment per-scale 0–9 histogram buckets for an instrument. No PII is stored. */
export async function bumpNorms(instrumentId: string, buckets: Record<string, number>): Promise<void> {
  const kv = await kvClient();
  if (!kv) return;
  try {
    for (const [scaleId, b] of Object.entries(buckets)) {
      const bucket = Math.max(0, Math.min(9, Math.floor(b)));
      await kv.hincrby(`norm:${instrumentId}`, `${scaleId}:${bucket}`, 1);
    }
  } catch {
    /* ignore */
  }
}

/** Read accumulated histograms: scaleId → 10-bucket count array. Empty without KV. */
export async function getNorms(instrumentId: string): Promise<Record<string, number[]>> {
  const kv = await kvClient();
  if (!kv) return {};
  try {
    const h = (await kv.hgetall(`norm:${instrumentId}`)) as Record<string, number> | null;
    if (!h) return {};
    const out: Record<string, number[]> = {};
    for (const [field, count] of Object.entries(h)) {
      const [scaleId, b] = field.split(":");
      (out[scaleId] ??= Array(10).fill(0))[Number(b)] += Number(count) || 0;
    }
    return out;
  } catch {
    return {};
  }
}

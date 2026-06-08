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

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEntitlements } from "./_kv";

/**
 * Lets the client recover entitlements for a result fingerprint (e.g., after a
 * closed tab, or on a second device). Returns the purchased products recorded by
 * the webhook. Without KV configured this returns no entitlements.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fp = (req.query.fp as string) || "";
  if (!fp) {
    res.status(400).json({ error: "missing_fp" });
    return;
  }
  const products = await getEntitlements(fp);
  res.status(200).json({ paid: products.length > 0, products });
}

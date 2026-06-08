import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "./_stripe";
import { recordEntitlement } from "./_kv";

// Stripe signature verification needs the raw body, so disable Vercel's parser.
export const config = { api: { bodyParser: false } };

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

/**
 * Robust fulfillment: Stripe POSTs here when a checkout completes. We verify the
 * signature and persist the entitlement (KV) so a purchase survives a closed tab
 * and can be recovered on another device. No-ops without a webhook secret.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    res.status(200).json({ ok: true, devMode: true });
    return;
  }

  let event: any;
  try {
    const buf = await rawBody(req);
    event = stripe.webhooks.constructEvent(buf, req.headers["stripe-signature"] as string, secret);
  } catch {
    res.status(400).json({ error: "invalid_signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const fp = session.metadata?.fingerprint;
    const product = session.metadata?.productId;
    if (fp && product) await recordEntitlement(fp, product);
  }

  res.status(200).json({ received: true });
}

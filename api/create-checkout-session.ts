import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe, PRICES, baseUrl } from "./_stripe";

/**
 * Creates a Stripe Checkout Session for a one-time digital purchase (no buyer
 * login required). Returns `{ url }` to redirect to, or `{ devMode: true }` when
 * Stripe isn't configured so the client can fall back to a clearly-labeled demo
 * unlock.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const { productId, fingerprint } = (req.body ?? {}) as { productId?: string; fingerprint?: string };
  const price = productId ? PRICES[productId] : undefined;
  if (!price) {
    res.status(400).json({ error: "unknown_product" });
    return;
  }

  const stripe = getStripe();
  if (!stripe) {
    res.status(200).json({ devMode: true });
    return;
  }

  const fp = (fingerprint ?? "").slice(0, 200);
  const base = baseUrl(req);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: price.cents,
            product_data: { name: price.name },
          },
        },
      ],
      success_url: `${base}/?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/?canceled=1`,
      client_reference_id: fp || undefined,
      metadata: { productId: productId!, fingerprint: fp },
      // Helpful for receipts; buyers still don't need an account.
      allow_promotion_codes: true,
    });
    res.status(200).json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: "stripe_error", message: err?.message ?? "unknown" });
  }
}

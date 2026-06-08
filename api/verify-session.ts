import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "./_stripe";

/**
 * Verifies a completed Checkout Session server-side before the client unlocks the
 * paid report. Returns `{ paid, product, fp }`. The metadata is read from Stripe
 * (trustworthy), not from URL params (spoofable).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sessionId = (req.query.session_id as string) || "";

  const stripe = getStripe();
  if (!stripe) {
    res.status(200).json({ paid: false, devMode: true });
    return;
  }
  if (!sessionId) {
    res.status(400).json({ error: "missing_session_id" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    res.status(200).json({
      paid,
      product: session.metadata?.productId ?? null,
      fp: session.metadata?.fingerprint ?? null,
    });
  } catch (err: any) {
    res.status(500).json({ error: "stripe_error", message: err?.message ?? "unknown" });
  }
}

import type Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  methodAllowed,
  prepareResponse,
  readRawBody,
  requireJsonContentType,
  sendKnownError,
  sendServiceUnavailable,
} from "./_http";
import {
  fulfillPurchase,
  isKvConfigured,
  KvUnavailableError,
  revokePayment,
} from "./_kv";
import { ConfigurationError, isDemoRuntime } from "./_runtime";
import { getStripe, verifiedCheckout } from "./_stripe";
import { stringValue } from "./_validation";

export const config = { api: { bodyParser: false } };
const MAX_WEBHOOK_BYTES = 1024 * 1024;

function webhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return null;
  if (!/^whsec_[A-Za-z0-9_]{20,}$/.test(secret)) {
    throw new ConfigurationError("STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

function directPaymentIntent(value: unknown): string | undefined {
  if (typeof value === "string" && /^pi_[A-Za-z0-9_]{6,240}$/.test(value)) return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" && /^pi_[A-Za-z0-9_]{6,240}$/.test(id)) return id;
  }
  return undefined;
}

async function paymentIntentForRevocation(
  stripe: Stripe,
  object: Record<string, unknown>,
): Promise<string | undefined> {
  const direct = directPaymentIntent(object.payment_intent);
  if (direct) return direct;

  const chargeValue = object.charge;
  if (chargeValue && typeof chargeValue === "object") {
    return directPaymentIntent((chargeValue as Record<string, unknown>).payment_intent);
  }
  if (typeof chargeValue === "string" && /^ch_[A-Za-z0-9_]{6,240}$/.test(chargeValue)) {
    const charge = await stripe.charges.retrieve(chargeValue);
    return directPaymentIntent(charge.payment_intent);
  }
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  prepareResponse(res);
  if (!methodAllowed(req, res, ["POST"])) return;

  try {
    requireJsonContentType(req);
    const stripe = getStripe();
    const secret = webhookSecret();
    if (!stripe || !secret) {
      if (isDemoRuntime() && !process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
        res.status(200).json({ received: false, devMode: true });
      } else {
        sendServiceUnavailable(res);
      }
      return;
    }
    if (!isKvConfigured()) {
      sendServiceUnavailable(res);
      return;
    }

    const signatureHeader = req.headers["stripe-signature"];
    const signature = stringValue(
      Array.isArray(signatureHeader) ? undefined : signatureHeader,
      "stripe-signature",
      {
        min: 16,
        max: 1_024,
        trim: false,
      },
    );
    const raw = await readRawBody(req, MAX_WEBHOOK_BYTES);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(raw, signature, secret);
    } catch {
      res.status(400).json({ error: "invalid_signature" });
      return;
    }
    if (!/^evt_[A-Za-z0-9_]{6,240}$/.test(event.id)) {
      res.status(400).json({ error: "invalid_event" });
      return;
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const checkout = verifiedCheckout(event.data.object as Stripe.Checkout.Session);
      if (!checkout) {
        // A Stripe account may send unrelated Checkout events to the endpoint.
        res.status(200).json({ received: true, handled: false });
        return;
      }
      await fulfillPurchase(event.id, checkout, event.created);
      res.status(200).json({ received: true, handled: true });
      return;
    }

    const reason =
      event.type === "charge.dispute.created"
        ? "dispute"
        : event.type === "charge.refunded" || event.type === "refund.created"
          ? "refund"
          : undefined;
    if (reason) {
      const paymentIntentId = await paymentIntentForRevocation(
        stripe,
        event.data.object as unknown as Record<string, unknown>,
      );
      if (!paymentIntentId) {
        res.status(200).json({ received: true, handled: false });
        return;
      }
      await revokePayment(event.id, paymentIntentId, reason, event.created);
      res.status(200).json({ received: true, handled: true });
      return;
    }

    res.status(200).json({ received: true, handled: false });
  } catch (error) {
    if (error instanceof KvUnavailableError) {
      sendServiceUnavailable(res);
      return;
    }
    sendKnownError(res, error);
  }
}

import type { VercelRequest, VercelResponse } from "./_vercel-types";
import {
  checkoutBindingCookieName,
  checkoutBrowserBindingHash,
  CHECKOUT_BINDING_MAX_AGE_SECONDS,
  createCheckoutBrowserNonce,
  createCheckoutSnapshot,
} from "./_crypto";
import {
  methodAllowed,
  prepareResponse,
  readJsonObject,
  sendKnownError,
  sendServiceUnavailable,
  setCheckoutBindingCookie,
} from "./_http";
import { isKvConfigured } from "./_kv";
import { enforceRateLimit } from "./_rate-limit";
import {
  ConfigurationError,
  isDemoRuntime,
} from "./_runtime";
import {
  applicationOrigin,
  checkoutLineItem,
  configuredProduct,
  getStripe,
  productIdValue,
  validateStripePrice,
} from "./_stripe";
import {
  exactKeys,
  fingerprintValue,
  ValidationError,
} from "./_validation";

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  prepareResponse(res);
  if (!methodAllowed(req, res, ["POST"])) return;
  if (
    !(await enforceRateLimit(req, res, {
      name: "checkout",
      limit: 10,
      windowSeconds: 10 * 60,
    }))
  ) {
    return;
  }

  try {
    const body = readJsonObject(req, 1_024);
    exactKeys(body, ["productId", "fingerprint"], ["productId", "fingerprint"]);
    const productId = productIdValue(body.productId);
    const fingerprint = fingerprintValue(body.fingerprint);
    const stripe = getStripe();
    if (!stripe) {
      if (isDemoRuntime()) {
        res.status(200).json({ devMode: true });
      } else {
        sendServiceUnavailable(res);
      }
      return;
    }
    if (!isDemoRuntime() && !isKvConfigured()) {
      sendServiceUnavailable(res);
      return;
    }

    const product = configuredProduct(productId);
    await validateStripePrice(stripe, product);
    const origin = applicationOrigin(req);
    const browserNonce = createCheckoutBrowserNonce();
    const snapshot = createCheckoutSnapshot({
      productId,
      fingerprint,
      amount: product.cents,
      currency: "usd",
      priceRef: product.priceReference,
      browserBindingHash: checkoutBrowserBindingHash(browserNonce),
    });
    if (snapshot.length > 500) throw new Error("checkout_snapshot_too_large");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [checkoutLineItem(product)],
      success_url: `${origin}/?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
      metadata: { checkout_snapshot: snapshot },
      expires_at: Math.floor(Date.now() / 1_000) + 30 * 60,
    });
    if (!session.url) throw new Error("missing_checkout_url");
    const checkoutUrl = new URL(session.url);
    if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.stripe.com") {
      throw new Error("invalid_checkout_url");
    }
    setCheckoutBindingCookie(
      res,
      checkoutBindingCookieName(session.id),
      browserNonce,
      !isDemoRuntime(),
      CHECKOUT_BINDING_MAX_AGE_SECONDS,
    );
    res.status(200).json({ url: checkoutUrl.toString() });
  } catch (error) {
    if (error instanceof ConfigurationError || error instanceof ValidationError) {
      sendKnownError(res, error);
      return;
    }
    // Keep provider and network details out of the response.
    res.status(502).json({ error: "checkout_unavailable" });
  }
}

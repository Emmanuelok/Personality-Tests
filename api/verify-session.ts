import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  checkoutBindingCookieName,
  createRecoveryToken,
  RECOVERY_MAX_AGE_SECONDS,
  verifyCheckoutBrowserBinding,
} from "./_crypto";
import {
  clearCheckoutBindingCookie,
  cookieValue,
  methodAllowed,
  prepareResponse,
  readJsonObject,
  sendKnownError,
  sendServiceUnavailable,
  setRecoveryCookie,
} from "./_http";
import {
  fulfillPurchase,
  isKvConfigured,
  KvUnavailableError,
} from "./_kv";
import { enforceRateLimit } from "./_rate-limit";
import { isDemoRuntime } from "./_runtime";
import { getStripe, verifiedCheckout } from "./_stripe";
import {
  exactKeys,
  stringValue,
  STRIPE_SESSION_PATTERN,
} from "./_validation";

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  prepareResponse(res);
  if (!methodAllowed(req, res, ["POST"])) return;
  if (
    !(await enforceRateLimit(req, res, {
      name: "verify-session",
      limit: 30,
      windowSeconds: 10 * 60,
    }))
  ) {
    return;
  }

  try {
    const body = readJsonObject(req, 1_024);
    exactKeys(body, ["sessionId"], ["sessionId"]);
    const sessionId = stringValue(body.sessionId, "sessionId", {
      min: 16,
      max: 255,
      pattern: STRIPE_SESSION_PATTERN,
    });
    const stripe = getStripe();
    if (!stripe) {
      if (isDemoRuntime()) {
        res.status(200).json({ paid: false, devMode: true });
      } else {
        sendServiceUnavailable(res);
      }
      return;
    }
    if (!isDemoRuntime() && !isKvConfigured()) {
      sendServiceUnavailable(res);
      return;
    }

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
      res.status(502).json({ error: "verification_unavailable" });
      return;
    }
    const checkout = verifiedCheckout(session);
    if (!checkout || checkout.sessionId !== sessionId) {
      res.status(400).json({ error: "invalid_session" });
      return;
    }
    const bindingCookieName = checkoutBindingCookieName(checkout.sessionId);
    const browserNonce = cookieValue(req, bindingCookieName);
    if (!verifyCheckoutBrowserBinding(checkout.browserBindingHash, browserNonce)) {
      res.status(401).json({ error: "checkout_binding_required" });
      return;
    }

    if (isKvConfigured()) {
      await fulfillPurchase(`verify:${checkout.sessionId}`, checkout);
    }
    const recoveryToken = createRecoveryToken(checkout.fingerprint, checkout.sessionId);
    setRecoveryCookie(
      res,
      checkout.fingerprint,
      recoveryToken,
      !isDemoRuntime(),
      RECOVERY_MAX_AGE_SECONDS,
    );
    clearCheckoutBindingCookie(res, bindingCookieName, !isDemoRuntime());
    res.status(200).json({
      paid: true,
      product: checkout.productId,
      fp: checkout.fingerprint,
    });
  } catch (error) {
    if (error instanceof KvUnavailableError) {
      sendServiceUnavailable(res);
      return;
    }
    sendKnownError(res, error);
  }
}

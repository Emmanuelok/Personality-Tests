import type { VercelRequest, VercelResponse } from "./_vercel-types";
import { recoverySessionId } from "./_crypto";
import {
  bearerToken,
  cookieValue,
  methodAllowed,
  prepareResponse,
  readJsonObject,
  sendKnownError,
  sendServiceUnavailable,
} from "./_http";
import {
  getEntitlementRevocationMarker,
  getEntitlements,
  isKvConfigured,
  KvUnavailableError,
} from "./_kv";
import { enforceRateLimit } from "./_rate-limit";
import { isDemoRuntime } from "./_runtime";
import { exactKeys, fingerprintValue } from "./_validation";

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  prepareResponse(res);
  if (!methodAllowed(req, res, ["POST"])) return;
  if (
    !(await enforceRateLimit(req, res, {
      name: "entitlement-status",
      limit: 60,
      windowSeconds: 10 * 60,
    }))
  ) {
    return;
  }

  try {
    const body = readJsonObject(req, 1_024);
    exactKeys(body, ["fingerprint"], ["fingerprint"]);
    const fingerprint = fingerprintValue(body.fingerprint);
    if (!isKvConfigured()) {
      if (isDemoRuntime()) {
        res.status(200).json({
          paid: false,
          products: [],
          revoked: false,
          devMode: true,
        });
      } else {
        sendServiceUnavailable(res);
      }
      return;
    }

    let revocationMarker = await getEntitlementRevocationMarker(fingerprint);

    const token =
      bearerToken(req) ??
      cookieValue(req, `pa_recovery_${fingerprint}`);
    const authorizedSessionId = token
      ? recoverySessionId(token, fingerprint)
      : null;
    if (!authorizedSessionId) {
      // A marker intentionally reveals no product information and may be
      // checked without recovery authorization. This lets a browser discard a
      // stale local report/poster grant after its recovery cookie has expired.
      if (revocationMarker) {
        res.status(200).json({
          paid: false,
          products: [],
          revoked: true,
          revocationMarker,
        });
        return;
      }
      res.status(401).json({ error: "recovery_authorization_required" });
      return;
    }

    const products = await getEntitlements(fingerprint, [authorizedSessionId]);
    // Close the narrow race where a webhook lands after the first marker read.
    revocationMarker =
      await getEntitlementRevocationMarker(fingerprint) ?? revocationMarker;
    res.status(200).json({
      paid: products.length > 0,
      products,
      revoked: revocationMarker !== null,
      ...(revocationMarker ? { revocationMarker } : {}),
    });
  } catch (error) {
    if (error instanceof KvUnavailableError) {
      sendServiceUnavailable(res);
      return;
    }
    sendKnownError(res, error);
  }
}

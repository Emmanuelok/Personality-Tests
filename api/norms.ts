import type { VercelRequest, VercelResponse } from "./_vercel-types";
import {
  methodAllowed,
  prepareResponse,
  readJsonObject,
  sendKnownError,
  sendServiceUnavailable,
} from "./_http";
import {
  bumpNorms,
  getNorms,
  isKvConfigured,
  MIN_NORM_SAMPLE_SIZE,
} from "./_kv";
import {
  catalogScaleIds,
  instrumentIdValue,
  parseNormContribution,
} from "./_norms-catalog";
import { enforceRateLimit } from "./_rate-limit";
import { isDemoRuntime } from "./_runtime";
import { assertOnlyQueryKeys, singleQueryValue } from "./_validation";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  prepareResponse(res);
  if (!methodAllowed(req, res, ["GET", "POST"])) return;

  try {
    if (req.method === "POST") {
      if (
        !(await enforceRateLimit(req, res, {
          name: "norm-contribution",
          limit: 30,
          windowSeconds: 24 * 60 * 60,
        }))
      ) {
        return;
      }
      const contribution = parseNormContribution(readJsonObject(req, 8 * 1_024));
      if (!isKvConfigured()) {
        if (isDemoRuntime()) {
          res.status(200).json({ ok: false, disabled: true });
        } else {
          sendServiceUnavailable(res);
        }
        return;
      }
      await bumpNorms(contribution.instrumentId, contribution.buckets);
      res.status(200).json({ ok: true });
      return;
    }

    if (
      !(await enforceRateLimit(req, res, {
        name: "norm-read",
        limit: 120,
        windowSeconds: 10 * 60,
      }))
    ) {
      return;
    }
    assertOnlyQueryKeys(req.query, ["instrumentId"]);
    const instrumentId = instrumentIdValue(
      singleQueryValue(req.query.instrumentId, "instrumentId", 64),
    );
    if (!isKvConfigured()) {
      if (isDemoRuntime()) {
        res.status(200).json({
          instrumentId,
          norms: {},
          minimumSampleSize: MIN_NORM_SAMPLE_SIZE,
          disabled: true,
        });
      } else {
        sendServiceUnavailable(res);
      }
      return;
    }

    const stored = await getNorms(instrumentId);
    const allowedScales = new Set(catalogScaleIds(instrumentId) ?? []);
    const published: Record<string, number[]> = {};
    for (const [scaleId, histogram] of Object.entries(stored)) {
      if (
        allowedScales.has(scaleId) &&
        histogram.length === 10 &&
        histogram.every((count) => Number.isSafeInteger(count) && count >= 0) &&
        histogram.reduce((total, count) => total + count, 0) >= MIN_NORM_SAMPLE_SIZE
      ) {
        published[scaleId] = histogram;
      }
    }
    res.status(200).json({
      instrumentId,
      norms: published,
      minimumSampleSize: MIN_NORM_SAMPLE_SIZE,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "storage_unavailable") {
      sendServiceUnavailable(res);
      return;
    }
    sendKnownError(res, error);
  }
}

import type { ScaleScore } from "@core/types";
import { isNormsEligibleInstrument } from "@core/catalogPolicy";

/**
 * Opt-in, privacy-safe community reference. With consent, the app sends only
 * coarse 0–9 response-position buckets (no answers, no identity). This
 * self-selected reference stays separate from local scoring and is not a
 * population norm. Everything no-ops gracefully without a backend.
 */

const CONSENT = "psyche.calib.consent";

export function calibConsent(): boolean {
  try { return localStorage.getItem(CONSENT) === "1"; } catch { return false; }
}
export function setCalibConsent(v: boolean): void {
  try { localStorage.setItem(CONSENT, v ? "1" : "0"); } catch { /* ignore */ }
}

const bucketOf = (pct: number) => Math.max(0, Math.min(9, Math.floor(pct / 10)));

/** Fire-and-forget: contribute this result's scale buckets (only with consent). */
export async function submitNorms(instrumentId: string, scales: Record<string, ScaleScore>): Promise<void> {
  if (!calibConsent() || !isNormsEligibleInstrument(instrumentId)) return;
  const buckets: Record<string, number> = {};
  for (const [scaleId, s] of Object.entries(scales)) buckets[scaleId] = bucketOf(s.normalized);
  try {
    await fetch("/api/norms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ instrumentId, buckets }),
    });
  } catch {
    /* offline / no backend — fine */
  }
}

/** Fetch accumulated histograms for an instrument (scaleId → 10 counts), or null. */
export async function fetchNorms(instrumentId: string): Promise<Record<string, number[]> | null> {
  if (!isNormsEligibleInstrument(instrumentId)) return null;
  try {
    const r = await fetch(`/api/norms?instrumentId=${encodeURIComponent(instrumentId)}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d && d.norms && Object.keys(d.norms).length ? (d.norms as Record<string, number[]>) : null;
  } catch {
    return null;
  }
}

/** Position within the opt-in community reference, or null below the sample threshold. */
export function communityPercentile(hist: number[] | undefined, normalized: number): number | null {
  if (!hist) return null;
  const total = hist.reduce((a, b) => a + b, 0);
  if (total < 20) return null; // not enough takers to be meaningful yet
  const b = bucketOf(normalized);
  let below = 0;
  for (let i = 0; i < b; i++) below += hist[i];
  below += (hist[b] || 0) / 2; // half-credit within the bucket
  return Math.max(1, Math.min(99, Math.round((below / total) * 100)));
}

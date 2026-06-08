// Shared server-side helpers for the checkout functions. Files prefixed with "_"
// are not treated as routes by Vercel.
import Stripe from "stripe";

function cents(envVar: string | undefined, fallback: number): number {
  const n = Number(envVar);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

/** Server-authoritative pricing. The client catalog is for display only. */
export const PRICES: Record<string, { cents: number; name: string }> = {
  report: { cents: cents(process.env.PRICE_REPORT_CENTS, 189), name: "Psyche Atlas — Full Report + Growth Plan" },
  cognitive: { cents: cents(process.env.PRICE_COGNITIVE_CENTS, 189), name: "Psyche Atlas — Full Cognitive Report" },
  allaccess: { cents: cents(process.env.PRICE_ALLACCESS_CENTS, 590), name: "Psyche Atlas — All-Access Pass" },
  poster: { cents: cents(process.env.PRICE_POSTER_CENTS, 290), name: "Psyche Atlas — Personality Poster" },
};

/** Returns a configured Stripe client, or null when running in demo mode (no key). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/** Build a trusted base URL from the request, avoiding open-redirect via client input. */
export function baseUrl(req: { headers: Record<string, any> }): string {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

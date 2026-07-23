/**
 * Product catalog for Psyche Atlas (pure data — safe to import anywhere).
 *
 * Pricing is mirrored server-side in `api/_stripe.ts`; the server is the source of
 * truth for what is actually charged. Prices here are for display only.
 */

import { CATALOG_INSTRUMENT_COUNT } from "./catalogPolicy";

export type ProductKind = "unlock" | "bundle" | "merch";

export interface Product {
  id: string;
  name: string;
  blurb: string;
  /** Display price in cents (server authoritative). */
  priceCents: number;
  currency: string;
  kind: ProductKind;
  /** Short bullet list of what's included. */
  includes: string[];
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "report",
    name: "Full Report + Growth Plan",
    blurb: "A detailed reflection report — and a personalized plan for practice and growth.",
    priceCents: 189,
    currency: "usd",
    kind: "unlock",
    badge: "Most popular",
    includes: [
      "Trait-by-trait standing, labeled by its evidence basis",
      "How your current trait observations interact",
      "Strengths, trade-offs & notable response patterns",
      "A goal-linked practice plan with evidence notes and clear limits",
      "A stunningly designed PDF + Markdown & data exports",
    ],
  },
  {
    id: "cognitive",
    name: "Reasoning Practice Report",
    blurb: "Unlock the activity-specific paid extension shown for this saved practice result.",
    priceCents: 189,
    currency: "usd",
    kind: "unlock",
    includes: [
      "The additional review available for the activity you completed",
      "Activity-specific detail, examples, or practical guidance",
      "A one-time unlock for this saved result on this device",
    ],
  },
  {
    id: "allaccess",
    name: "All-Access Pass",
    blurb: "Unlock the paid extension available for every personality reflection and reasoning practice result on this device.",
    priceCents: 590,
    currency: "usd",
    kind: "bundle",
    badge: "Best value",
    includes: [
      `Unlocks reports for all ${CATALOG_INSTRUMENT_COUNT} personality reflection activities and every reasoning practice activity`,
      "Full personality reports, growth plans, exports, and posters",
      "Question review and a PDF for full reasoning sets",
      "Activity-specific growth guides for standalone practice activities",
    ],
  },
  {
    id: "poster",
    name: "Personality Poster",
    blurb: "A print-ready, designed PDF poster of your profile — great on a wall.",
    priceCents: 290,
    currency: "usd",
    kind: "merch",
    includes: ["Everything in the Full Report", "A designed, print-ready poster PDF of your profile"],
  },
];

/** Products that can truthfully be fulfilled from a personality-result paywall. */
export const PERSONALITY_RESULT_PRODUCTS: readonly Product[] = Object.freeze(
  PRODUCTS.filter((product) => product.id !== "cognitive"),
);

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatPrice(cents: number, currency = "usd"): string {
  const symbol = currency.toLowerCase() === "usd" ? "$" : "";
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

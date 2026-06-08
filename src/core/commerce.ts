/**
 * Product catalog for Psyche Atlas (pure data — safe to import anywhere).
 *
 * Pricing is mirrored server-side in `api/_stripe.ts`; the server is the source of
 * truth for what is actually charged. Prices here are for display only.
 */

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
    blurb: "Your complete, one-of-a-kind report — and a personalized plan to grow.",
    priceCents: 189,
    currency: "usd",
    kind: "unlock",
    badge: "Most popular",
    includes: [
      "Trait-by-trait deep dive with percentiles",
      "How your traits interact (your unique dynamics)",
      "Strengths, blind spots & the answers that make you you",
      "A personalized, evidence-based growth plan",
      "A stunningly designed PDF + Markdown & data exports",
    ],
  },
  {
    id: "cognitive",
    name: "Full Cognitive Report",
    blurb: "Your complete cognitive profile — every question explained, plus a designed PDF.",
    priceCents: 189,
    currency: "usd",
    kind: "unlock",
    includes: [
      "Your estimated band & percentile across every domain",
      "Every question reviewed — what you missed and why",
      "Domain-by-domain interpretation of your profile",
      "A designed, shareable cognitive report PDF",
    ],
  },
  {
    id: "allaccess",
    name: "All-Access Pass",
    blurb: "Unlock the full report for every assessment you take on this device.",
    priceCents: 590,
    currency: "usd",
    kind: "bundle",
    badge: "Best value",
    includes: [
      "Everything in the Full Report",
      "Unlocks Big Five, 16 Types, Enneagram & future tests",
      "All formats, for every result you generate",
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

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatPrice(cents: number, currency = "usd"): string {
  const symbol = currency.toLowerCase() === "usd" ? "$" : "";
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

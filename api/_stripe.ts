import Stripe from "stripe";
import { verifyCheckoutSnapshot } from "./_crypto";
import { ConfigurationError, isDemoRuntime } from "./_runtime";
import {
  STRIPE_SESSION_PATTERN,
  stringValue,
  ValidationError,
} from "./_validation";

export const PRODUCT_IDS = ["report", "cognitive", "allaccess", "poster"] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

interface ProductDefinition {
  id: ProductId;
  name: string;
  fallbackCents: number;
  priceEnvironmentKey: string;
  centsEnvironmentKey: string;
}

export interface ConfiguredProduct extends ProductDefinition {
  cents: number;
  priceId?: string;
  priceReference: string;
}

export interface VerifiedCheckout {
  sessionId: string;
  paymentIntentId: string;
  productId: ProductId;
  fingerprint: string;
  amount: number;
  currency: "usd";
  browserBindingHash: string;
}

const PRODUCT_CATALOG: Readonly<Record<ProductId, ProductDefinition>> = {
  report: {
    id: "report",
    name: "Psyche Atlas — Full Report + Growth Plan",
    fallbackCents: 189,
    priceEnvironmentKey: "STRIPE_PRICE_REPORT_ID",
    centsEnvironmentKey: "PRICE_REPORT_CENTS",
  },
  cognitive: {
    id: "cognitive",
    name: "Psyche Atlas — Full Cognitive Report",
    fallbackCents: 189,
    priceEnvironmentKey: "STRIPE_PRICE_COGNITIVE_ID",
    centsEnvironmentKey: "PRICE_COGNITIVE_CENTS",
  },
  allaccess: {
    id: "allaccess",
    name: "Psyche Atlas — All-Access Pass",
    fallbackCents: 590,
    priceEnvironmentKey: "STRIPE_PRICE_ALLACCESS_ID",
    centsEnvironmentKey: "PRICE_ALLACCESS_CENTS",
  },
  poster: {
    id: "poster",
    name: "Psyche Atlas — Personality Poster",
    fallbackCents: 290,
    priceEnvironmentKey: "STRIPE_PRICE_POSTER_ID",
    centsEnvironmentKey: "PRICE_POSTER_CENTS",
  },
};

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && (PRODUCT_IDS as readonly string[]).includes(value);
}

export function productIdValue(value: unknown): ProductId {
  if (!isProductId(value)) throw new ValidationError("unknown_product", "productId");
  return value;
}

function configuredCents(definition: ProductDefinition): number {
  const raw = process.env[definition.centsEnvironmentKey];
  if (raw === undefined || raw === "") return definition.fallbackCents;
  if (!/^\d{2,7}$/.test(raw)) throw new ConfigurationError(definition.centsEnvironmentKey);
  const cents = Number(raw);
  if (!Number.isSafeInteger(cents) || cents < 50 || cents > 1_000_000) {
    throw new ConfigurationError(definition.centsEnvironmentKey);
  }
  return cents;
}

export function configuredProduct(id: ProductId): ConfiguredProduct {
  const definition = PRODUCT_CATALOG[id];
  const configuredPriceId = process.env[definition.priceEnvironmentKey];
  const priceId = configuredPriceId
    ? stringValue(configuredPriceId, definition.priceEnvironmentKey, {
        min: 12,
        max: 128,
        pattern: /^price_[A-Za-z0-9_]+$/,
        trim: false,
      })
    : undefined;
  if (!isDemoRuntime() && !priceId) {
    throw new ConfigurationError(definition.priceEnvironmentKey);
  }
  const cents = configuredCents(definition);
  return {
    ...definition,
    cents,
    priceId,
    priceReference: priceId ?? `inline:${cents}:usd`,
  };
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!/^sk_(?:test|live)_[A-Za-z0-9_]{12,}$/.test(key)) {
    throw new ConfigurationError("STRIPE_SECRET_KEY");
  }
  return new Stripe(key, {
    maxNetworkRetries: 1,
    timeout: 8_000,
  });
}

/**
 * A configured Stripe Price is re-read before checkout and matched to the
 * server-side catalog. This catches disabled, recurring, or accidentally
 * repriced entries before a buyer can be sent to Checkout.
 */
export async function validateStripePrice(
  stripe: Stripe,
  product: ConfiguredProduct,
): Promise<void> {
  if (!product.priceId) return;
  const price = await stripe.prices.retrieve(product.priceId);
  if (
    !price.active ||
    price.type !== "one_time" ||
    price.currency !== "usd" ||
    price.unit_amount !== product.cents
  ) {
    throw new ConfigurationError(product.priceEnvironmentKey);
  }
}

export function checkoutLineItem(
  product: ConfiguredProduct,
): Stripe.Checkout.SessionCreateParams.LineItem {
  if (product.priceId) return { quantity: 1, price: product.priceId };
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: product.cents,
      product_data: { name: product.name },
    },
  };
}

export function verifiedCheckout(session: Stripe.Checkout.Session): VerifiedCheckout | null {
  try {
    if (
      !STRIPE_SESSION_PATTERN.test(session.id) ||
      session.mode !== "payment" ||
      session.status !== "complete" ||
      session.payment_status !== "paid" ||
      session.currency !== "usd"
    ) {
      return null;
    }
    const token = session.metadata?.checkout_snapshot;
    if (typeof token !== "string" || token.length > 2_048) return null;
    const snapshot = verifyCheckoutSnapshot(token);
    const productId = productIdValue(snapshot.productId);
    if (
      session.amount_subtotal !== snapshot.amount ||
      session.amount_total !== snapshot.amount ||
      (typeof session.created === "number" &&
        Math.abs(session.created - snapshot.issuedAt) > 10 * 60)
    ) {
      return null;
    }
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (
      typeof paymentIntentId !== "string" ||
      !/^pi_[A-Za-z0-9_]{6,240}$/.test(paymentIntentId)
    ) {
      return null;
    }
    return {
      sessionId: session.id,
      paymentIntentId,
      productId,
      fingerprint: snapshot.fingerprint,
      amount: snapshot.amount,
      currency: "usd",
      browserBindingHash: snapshot.browserBindingHash,
    };
  } catch {
    return null;
  }
}

export function applicationOrigin(req: { headers: Record<string, unknown> }): string {
  const configured = process.env.APP_ORIGIN;
  if (configured) {
    let url: URL;
    try {
      url = new URL(configured);
    } catch {
      throw new ConfigurationError("APP_ORIGIN");
    }
    if (
      (url.protocol !== "https:" && !(url.protocol === "http:" && isDemoRuntime())) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new ConfigurationError("APP_ORIGIN");
    }
    return url.origin;
  }
  if (!isDemoRuntime()) throw new ConfigurationError("APP_ORIGIN");

  const rawHost = req.headers["x-forwarded-host"] ?? req.headers.host;
  const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;
  if (typeof host !== "string" || !/^(?:localhost|\[::1\]|127\.0\.0\.1)(?::\d{1,5})?$/.test(host)) {
    throw new ConfigurationError("APP_ORIGIN");
  }
  return `http://${host}`;
}

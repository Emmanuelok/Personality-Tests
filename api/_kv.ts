import { createHash } from "node:crypto";
import { ConfigurationError, isDemoRuntime } from "./_runtime";
import { isProductId, type ProductId } from "./_stripe";
import { FINGERPRINT_PATTERN, STRIPE_ID_PATTERN } from "./_validation";

export const MIN_NORM_SAMPLE_SIZE = 250;
const DATA_TTL_SECONDS = 2 * 365 * 24 * 60 * 60;
const EVENT_TTL_SECONDS = 180 * 24 * 60 * 60;
const KV_TIMEOUT_MS = 3_000;

type RedisArgument = string | number;

interface KvResponse<T> {
  result?: T;
  error?: string;
}

export class KvUnavailableError extends Error {
  constructor() {
    super("storage_unavailable");
    this.name = "KvUnavailableError";
  }
}

interface KvConfiguration {
  url: string;
  token: string;
}

function configuredValue(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

function kvConfiguration(): KvConfiguration | null {
  const url = configuredValue("KV_REST_API_URL", "UPSTASH_REDIS_REST_URL");
  const token = configuredValue("KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN");
  if (!url && !token) return null;
  if (!url || !token) throw new ConfigurationError("KV_REST_API_URL/KV_REST_API_TOKEN");

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ConfigurationError("KV_REST_API_URL");
  }
  const localHttp =
    isDemoRuntime() &&
    parsed.protocol === "http:" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
  if ((parsed.protocol !== "https:" && !localHttp) || parsed.username || parsed.password) {
    throw new ConfigurationError("KV_REST_API_URL");
  }
  return { url: parsed.toString().replace(/\/+$/, ""), token };
}

export function isKvConfigured(): boolean {
  try {
    return kvConfiguration() !== null;
  } catch {
    return false;
  }
}

/**
 * Execute one Redis command through the Vercel KV/Upstash REST protocol.
 * Exported so the rate limiter can share the same durable connection.
 */
export async function kvCommand<T>(command: readonly RedisArgument[]): Promise<T> {
  const configuration = kvConfiguration();
  if (!configuration) throw new KvUnavailableError();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), KV_TIMEOUT_MS);
  try {
    const response = await fetch(configuration.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${configuration.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      signal: controller.signal,
    });
    if (!response.ok) throw new KvUnavailableError();
    const body = (await response.json()) as KvResponse<T>;
    if (body.error || !("result" in body)) throw new KvUnavailableError();
    return body.result as T;
  } catch (error) {
    if (error instanceof ConfigurationError || error instanceof KvUnavailableError) throw error;
    throw new KvUnavailableError();
  } finally {
    clearTimeout(timeout);
  }
}

export async function kvEval<T>(
  script: string,
  keys: readonly string[],
  arguments_: readonly RedisArgument[],
): Promise<T> {
  return kvCommand<T>(["EVAL", script, keys.length, ...keys, ...arguments_]);
}

function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safeKeyPart(value: string): string {
  return digest(value).slice(0, 40);
}

/* ── Anonymous score-distribution norms ────────────────────────────────── */

const BUMP_NORMS_SCRIPT = `
for i = 1, #ARGV, 2 do
  redis.call("HINCRBY", KEYS[1], ARGV[i], ARGV[i + 1])
end
redis.call("EXPIRE", KEYS[1], ${DATA_TTL_SECONDS})
return #ARGV / 2
`;

/** Atomically add one complete, already-catalog-validated contribution. */
export async function bumpNorms(
  instrumentId: string,
  buckets: Readonly<Record<string, number>>,
): Promise<boolean> {
  if (!isKvConfigured()) return false;
  const arguments_: RedisArgument[] = [];
  for (const [scaleId, bucket] of Object.entries(buckets)) {
    arguments_.push(`${scaleId}:${bucket}`, 1);
  }
  await kvEval<number>(
    BUMP_NORMS_SCRIPT,
    [`pa:v2:norm:${safeKeyPart(instrumentId)}`],
    arguments_,
  );
  return true;
}

function normalizeHashReply(value: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (Array.isArray(value)) {
    for (let index = 0; index + 1 < value.length; index += 2) {
      if (typeof value[index] !== "string") continue;
      const count = Number(value[index + 1]);
      if (Number.isSafeInteger(count) && count >= 0) out[value[index] as string] = count;
    }
    return out;
  }
  if (value && typeof value === "object") {
    for (const [field, raw] of Object.entries(value)) {
      const count = Number(raw);
      if (Number.isSafeInteger(count) && count >= 0) out[field] = count;
    }
  }
  return out;
}

/** Read raw histograms. Publication thresholds are applied by the handler. */
export async function getNorms(instrumentId: string): Promise<Record<string, number[]>> {
  if (!isKvConfigured()) return {};
  const reply = await kvCommand<unknown>([
    "HGETALL",
    `pa:v2:norm:${safeKeyPart(instrumentId)}`,
  ]);
  const hash = normalizeHashReply(reply);
  const out: Record<string, number[]> = {};
  for (const [field, count] of Object.entries(hash)) {
    const separator = field.lastIndexOf(":");
    if (separator <= 0) continue;
    const scaleId = field.slice(0, separator);
    const bucket = Number(field.slice(separator + 1));
    if (!Number.isInteger(bucket) || bucket < 0 || bucket > 9) continue;
    (out[scaleId] ??= Array<number>(10).fill(0))[bucket] += count;
  }
  return out;
}

/* ── Entitlements and Stripe event idempotency ─────────────────────────── */

export interface PurchaseRecord {
  sessionId: string;
  paymentIntentId: string;
  productId: ProductId;
  fingerprint: string;
  amount: number;
  currency: "usd";
  status: "active" | "revoked";
  fulfilledAt: number;
  revokedAt?: number;
  revokeReason?: "refund" | "dispute";
}

export type PurchaseInput = Omit<
  PurchaseRecord,
  "status" | "fulfilledAt" | "revokedAt" | "revokeReason"
>;

function eventKey(eventId: string): string {
  return `pa:v2:event:${safeKeyPart(eventId)}`;
}

function purchaseKey(sessionId: string): string {
  return `pa:v2:purchase:${safeKeyPart(sessionId)}`;
}

function entitlementKey(fingerprint: string): string {
  return `pa:v2:ent:${fingerprint.toLowerCase()}`;
}

function entitlementRevocationKey(fingerprint: string): string {
  return `pa:v2:ent-revoked:${fingerprint.toLowerCase()}`;
}

function paymentIndexKey(paymentIntentId: string): string {
  return `pa:v2:payment:${safeKeyPart(paymentIntentId)}`;
}

function revokedPaymentKey(paymentIntentId: string): string {
  return `pa:v2:revoked:${safeKeyPart(paymentIntentId)}`;
}

const FULFILL_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 1 then
  return 0
end
local purchase = cjson.decode(ARGV[2])
if redis.call("EXISTS", KEYS[5]) == 1 then
  purchase.status = "revoked"
  purchase.revokedAt = tonumber(ARGV[6])
  redis.call("SET", KEYS[6], redis.call("GET", KEYS[5]), "EX", ARGV[4])
else
  redis.call("SADD", KEYS[3], ARGV[3])
  redis.call("EXPIRE", KEYS[3], ARGV[4])
end
redis.call("SET", KEYS[2], cjson.encode(purchase), "EX", ARGV[4])
redis.call("SET", KEYS[4], ARGV[5], "EX", ARGV[4])
redis.call("SET", KEYS[1], "1", "EX", ARGV[1])
return 1
`;

export async function fulfillPurchase(
  idempotencyId: string,
  purchase: PurchaseInput,
  nowSeconds = Math.floor(Date.now() / 1_000),
): Promise<"applied" | "duplicate"> {
  if (!isKvConfigured()) throw new KvUnavailableError();
  const record: PurchaseRecord = {
    sessionId: purchase.sessionId,
    paymentIntentId: purchase.paymentIntentId,
    productId: purchase.productId,
    fingerprint: purchase.fingerprint,
    amount: purchase.amount,
    currency: purchase.currency,
    status: "active",
    fulfilledAt: nowSeconds,
  };
  const purchaseStorageKey = purchaseKey(purchase.sessionId);
  const entitlementStorageKey = entitlementKey(purchase.fingerprint);
  const index = JSON.stringify({
    purchaseKey: purchaseStorageKey,
    entitlementKey: entitlementStorageKey,
    revocationKey: entitlementRevocationKey(purchase.fingerprint),
    sessionId: purchase.sessionId,
  });
  const applied = await kvEval<number>(
    FULFILL_SCRIPT,
    [
      eventKey(idempotencyId),
      purchaseStorageKey,
      entitlementStorageKey,
      paymentIndexKey(purchase.paymentIntentId),
      revokedPaymentKey(purchase.paymentIntentId),
      entitlementRevocationKey(purchase.fingerprint),
    ],
    [
      EVENT_TTL_SECONDS,
      JSON.stringify(record),
      purchase.sessionId,
      DATA_TTL_SECONDS,
      index,
      nowSeconds,
    ],
  );
  return applied === 1 ? "applied" : "duplicate";
}

const REVOKE_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 1 then
  return 0
end
redis.call("SET", KEYS[3], ARGV[5], "EX", ARGV[3])
local rawIndex = redis.call("GET", KEYS[2])
if not rawIndex then
  redis.call("SET", KEYS[1], "1", "EX", ARGV[1])
  return 1
end
local index = cjson.decode(rawIndex)
local rawPurchase = redis.call("GET", index.purchaseKey)
local revocationKey = index.revocationKey
if not revocationKey then
  local prefix = "pa:v2:ent:"
  if string.sub(index.entitlementKey, 1, string.len(prefix)) == prefix then
    revocationKey = "pa:v2:ent-revoked:" .. string.sub(index.entitlementKey, string.len(prefix) + 1)
  end
end
if revocationKey then
  redis.call("SET", revocationKey, ARGV[5], "EX", ARGV[3])
end
if rawPurchase then
  local purchase = cjson.decode(rawPurchase)
  purchase.status = "revoked"
  purchase.revokedAt = tonumber(ARGV[2])
  purchase.revokeReason = ARGV[4]
  redis.call("SET", index.purchaseKey, cjson.encode(purchase), "EX", ARGV[3])
end
redis.call("SREM", index.entitlementKey, index.sessionId)
redis.call("SET", KEYS[1], "1", "EX", ARGV[1])
return 1
`;

export async function revokePayment(
  idempotencyId: string,
  paymentIntentId: string,
  reason: "refund" | "dispute",
  nowSeconds = Math.floor(Date.now() / 1_000),
): Promise<"applied" | "duplicate"> {
  if (!isKvConfigured()) throw new KvUnavailableError();
  const applied = await kvEval<number>(
    REVOKE_SCRIPT,
    [
      eventKey(idempotencyId),
      paymentIndexKey(paymentIntentId),
      revokedPaymentKey(paymentIntentId),
    ],
    [
      EVENT_TTL_SECONDS,
      nowSeconds,
      DATA_TTL_SECONDS,
      reason,
      safeKeyPart(idempotencyId),
    ],
  );
  return applied === 1 ? "applied" : "duplicate";
}

function parsePurchase(value: unknown): PurchaseRecord | null {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const record = parsed as Partial<PurchaseRecord>;
  if (
    typeof record.sessionId !== "string" ||
    !/^cs_(?:test|live)_[A-Za-z0-9]{8,240}$/.test(record.sessionId) ||
    typeof record.paymentIntentId !== "string" ||
    !/^pi_[A-Za-z0-9_]{6,240}$/.test(record.paymentIntentId) ||
    !isProductId(record.productId) ||
    typeof record.fingerprint !== "string" ||
    !FINGERPRINT_PATTERN.test(record.fingerprint) ||
    !Number.isSafeInteger(record.amount) ||
    record.currency !== "usd" ||
    (record.status !== "active" && record.status !== "revoked") ||
    !Number.isSafeInteger(record.fulfilledAt)
  ) {
    return null;
  }
  return record as PurchaseRecord;
}

export async function getEntitlements(
  fingerprint: string,
  authorizedSessionIds?: readonly string[],
): Promise<ProductId[]> {
  if (!isKvConfigured()) return [];
  const sessionIds: unknown = authorizedSessionIds ??
    await kvCommand<unknown>(["SMEMBERS", entitlementKey(fingerprint)]);
  if (!Array.isArray(sessionIds) || sessionIds.length === 0) return [];
  const safeSessionIds = sessionIds
    .filter((value): value is string => typeof value === "string" && STRIPE_ID_PATTERN.test(value))
    .slice(0, 100);
  if (safeSessionIds.length === 0) return [];
  const records = await kvCommand<unknown[]>([
    "MGET",
    ...safeSessionIds.map((sessionId) => purchaseKey(sessionId)),
  ]);
  if (!Array.isArray(records)) throw new KvUnavailableError();

  const products = new Set<ProductId>();
  for (const raw of records) {
    const purchase = parsePurchase(raw);
    if (
      purchase?.status === "active" &&
      purchase.fingerprint === fingerprint
    ) {
      products.add(purchase.productId);
    }
  }
  return PRODUCT_ORDER.filter((product) => products.has(product));
}

/**
 * Privacy-minimal revocation check. The opaque marker changes for each applied
 * refund/dispute, allowing a browser to acknowledge a revocation without the
 * server disclosing a product, amount, payment identifier, or reason.
 */
export async function getEntitlementRevocationMarker(
  fingerprint: string,
): Promise<string | null> {
  if (!isKvConfigured()) return null;
  const marker = await kvCommand<unknown>([
    "GET",
    entitlementRevocationKey(fingerprint),
  ]);
  if (marker === null) return null;
  if (typeof marker !== "string" || !/^[a-f0-9]{40}$/.test(marker)) {
    throw new KvUnavailableError();
  }
  return marker;
}

const PRODUCT_ORDER: readonly ProductId[] = ["report", "cognitive", "allaccess", "poster"];

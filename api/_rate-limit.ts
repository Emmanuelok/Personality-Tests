import { createHash, createHmac, randomBytes } from "node:crypto";
import type { VercelRequest, VercelResponse } from "./_vercel-types";
import { isKvConfigured, KvUnavailableError, kvEval } from "./_kv";

interface RateLimitSpec {
  name: string;
  limit: number;
  windowSeconds: number;
}

interface MemoryEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, MemoryEntry>();
const processSalt = randomBytes(32);
const MAX_MEMORY_BUCKETS = 10_000;

function firstHeader(req: VercelRequest, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function requestAddress(req: VercelRequest): string {
  // Vercel overwrites this header at its edge. The socket fallback is used by
  // local development and tests, where no trusted edge header exists.
  const forwarded = firstHeader(req, "x-vercel-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 128);
  const real = firstHeader(req, "x-real-ip");
  if (real) return real.trim().slice(0, 128);
  return req.socket?.remoteAddress?.slice(0, 128) ?? "unknown";
}

function privacyPreservingIdentity(req: VercelRequest): string {
  const address = requestAddress(req);
  const secret = process.env.RATE_LIMIT_SECRET;
  if (secret && Buffer.byteLength(secret, "utf8") >= 32) {
    return createHmac("sha256", secret).update(address, "utf8").digest("hex");
  }
  if (isKvConfigured()) {
    // Durable counters need the same privacy-preserving identity on every
    // function instance. Silently using a process-local salt would weaken the
    // distributed limit, so a configured KV deployment fails closed instead.
    throw new Error("rate_limit_secret_required");
  }
  // A process-local salt keeps raw network addresses out of memory. Configure
  // RATE_LIMIT_SECRET to make identities stable across durable KV instances.
  return createHash("sha256")
    .update(processSalt)
    .update(address, "utf8")
    .digest("hex");
}

function cleanMemoryBuckets(now: number): void {
  for (const [key, value] of memoryBuckets) {
    if (value.resetAt <= now) memoryBuckets.delete(key);
  }
  while (memoryBuckets.size > MAX_MEMORY_BUCKETS) {
    const oldest = memoryBuckets.keys().next().value as string | undefined;
    if (!oldest) break;
    memoryBuckets.delete(oldest);
  }
}

function inMemoryRateLimit(key: string, spec: RateLimitSpec, now: number): RateLimitResult {
  if (memoryBuckets.size >= MAX_MEMORY_BUCKETS) cleanMemoryBuckets(now);
  let entry = memoryBuckets.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + spec.windowSeconds * 1_000 };
    memoryBuckets.set(key, entry);
  }
  entry.count += 1;
  return {
    allowed: entry.count <= spec.limit,
    limit: spec.limit,
    remaining: Math.max(0, spec.limit - entry.count),
    resetAt: entry.resetAt,
  };
}

const RATE_LIMIT_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { count, ttl }
`;

async function durableRateLimit(
  key: string,
  spec: RateLimitSpec,
  now: number,
): Promise<RateLimitResult> {
  const result = await kvEval<[number, number]>(
    RATE_LIMIT_SCRIPT,
    [`pa:v2:rate:${spec.name}:${key}`],
    [spec.windowSeconds * 1_000],
  );
  if (
    !Array.isArray(result) ||
    !Number.isFinite(Number(result[0])) ||
    !Number.isFinite(Number(result[1]))
  ) {
    throw new KvUnavailableError();
  }
  const count = Number(result[0]);
  const ttl = Math.max(0, Number(result[1]));
  return {
    allowed: count <= spec.limit,
    limit: spec.limit,
    remaining: Math.max(0, spec.limit - count),
    resetAt: now + ttl,
  };
}

function setHeaders(res: VercelResponse, result: RateLimitResult): void {
  const resetSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1_000));
  res.setHeader("RateLimit-Limit", String(result.limit));
  res.setHeader("RateLimit-Remaining", String(result.remaining));
  res.setHeader("RateLimit-Reset", String(resetSeconds));
}

export async function enforceRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  spec: RateLimitSpec,
): Promise<boolean> {
  const now = Date.now();
  let result: RateLimitResult;
  try {
    const key = privacyPreservingIdentity(req);
    result = isKvConfigured()
      ? await durableRateLimit(key, spec, now)
      : inMemoryRateLimit(`${spec.name}:${key}`, spec, now);
  } catch {
    res.setHeader("Retry-After", "30");
    res.status(503).json({ error: "service_unavailable" });
    return false;
  }

  setHeaders(res, result);
  if (result.allowed) return true;
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - now) / 1_000));
  res.setHeader("Retry-After", String(retryAfter));
  res.status(429).json({ error: "rate_limited" });
  return false;
}

/** Test isolation for the process-local fallback. */
export function resetMemoryRateLimitsForTests(): void {
  memoryBuckets.clear();
}

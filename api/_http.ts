import type { VercelRequest, VercelResponse } from "./_vercel-types";
import { ConfigurationError } from "./_runtime";
import { isPlainObject, ValidationError, type JsonObject } from "./_validation";

const JSON_CONTENT_TYPE = /^application\/(?:[a-z0-9!#$&^_.+-]+\+)?json(?:\s*;.*)?$/i;

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
};

export function prepareResponse(res: VercelResponse): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(name, value);
  }
}

export function methodAllowed(
  req: VercelRequest,
  res: VercelResponse,
  methods: readonly string[],
): boolean {
  if (req.method && methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  res.status(405).json({ error: "method_not_allowed" });
  return false;
}

function headerValue(req: VercelRequest, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

export function requireJsonContentType(req: VercelRequest): void {
  const contentType = headerValue(req, "content-type");
  if (!contentType || !JSON_CONTENT_TYPE.test(contentType)) {
    throw new ValidationError("unsupported_media_type", "content-type");
  }
}

export function declaredContentLength(req: VercelRequest): number | undefined {
  const raw = headerValue(req, "content-length");
  if (raw === undefined) return undefined;
  if (!/^\d{1,12}$/.test(raw)) throw new ValidationError("invalid_content_length", "content-length");
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed)) {
    throw new ValidationError("invalid_content_length", "content-length");
  }
  return parsed;
}

function serializedByteLength(value: unknown): number {
  if (typeof value === "string") return Buffer.byteLength(value, "utf8");
  if (Buffer.isBuffer(value)) return value.byteLength;
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf8");
  } catch {
    throw new ValidationError("invalid_json", "body");
  }
}

export function readJsonObject(req: VercelRequest, maximumBytes: number): JsonObject {
  requireJsonContentType(req);
  const declared = declaredContentLength(req);
  if (declared !== undefined && declared > maximumBytes) {
    throw new ValidationError("body_too_large", "body");
  }

  let parsed: unknown = req.body;
  if (typeof parsed === "string" || Buffer.isBuffer(parsed)) {
    if (serializedByteLength(parsed) > maximumBytes) {
      throw new ValidationError("body_too_large", "body");
    }
    try {
      parsed = JSON.parse(parsed.toString());
    } catch {
      throw new ValidationError("invalid_json", "body");
    }
  } else if (serializedByteLength(parsed) > maximumBytes) {
    throw new ValidationError("body_too_large", "body");
  }

  if (!isPlainObject(parsed)) throw new ValidationError("invalid_object", "body");
  return parsed;
}

export async function readRawBody(req: VercelRequest, maximumBytes: number): Promise<Buffer> {
  const declared = declaredContentLength(req);
  if (declared !== undefined && declared > maximumBytes) {
    throw new ValidationError("body_too_large", "body");
  }

  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk);
    total += buffer.byteLength;
    if (total > maximumBytes) throw new ValidationError("body_too_large", "body");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, total);
}

export function sendKnownError(res: VercelResponse, error: unknown): void {
  if (error instanceof ValidationError) {
    const status =
      error.code === "unsupported_media_type" ? 415 :
      error.code === "body_too_large" ? 413 :
      400;
    res.status(status).json({
      error: error.code,
      ...(error.field ? { field: error.field } : {}),
    });
    return;
  }
  if (error instanceof ConfigurationError) {
    res.status(503).json({ error: "service_unavailable" });
    return;
  }
  res.status(500).json({ error: "internal_error" });
}

export function sendServiceUnavailable(res: VercelResponse): void {
  res.setHeader("Retry-After", "60");
  res.status(503).json({ error: "service_unavailable" });
}

function appendSetCookie(res: VercelResponse, cookie: string): void {
  const existing = res.getHeader("Set-Cookie");
  if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [...existing.map(String), cookie]);
  } else if (existing !== undefined) {
    res.setHeader("Set-Cookie", [String(existing), cookie]);
  } else {
    res.setHeader("Set-Cookie", cookie);
  }
}

export function setRecoveryCookie(
  res: VercelResponse,
  fingerprint: string,
  token: string,
  secure: boolean,
  maximumAgeSeconds: number,
): void {
  const name = `pa_recovery_${fingerprint}`;
  const parts = [
    `${name}=${encodeURIComponent(token)}`,
    "Path=/api/entitlement-status",
    `Max-Age=${maximumAgeSeconds}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  appendSetCookie(res, parts.join("; "));
}

export function setCheckoutBindingCookie(
  res: VercelResponse,
  name: string,
  browserNonce: string,
  secure: boolean,
  maximumAgeSeconds: number,
): void {
  const parts = [
    `${name}=${encodeURIComponent(browserNonce)}`,
    "Path=/api/verify-session",
    `Max-Age=${maximumAgeSeconds}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  appendSetCookie(res, parts.join("; "));
}

export function clearCheckoutBindingCookie(
  res: VercelResponse,
  name: string,
  secure: boolean,
): void {
  const parts = [
    `${name}=`,
    "Path=/api/verify-session",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  appendSetCookie(res, parts.join("; "));
}

export function cookieValue(req: VercelRequest, name: string): string | undefined {
  const raw = headerValue(req, "cookie");
  if (!raw) return undefined;
  for (const segment of raw.split(";")) {
    const equals = segment.indexOf("=");
    if (equals <= 0) continue;
    if (segment.slice(0, equals).trim() !== name) continue;
    try {
      return decodeURIComponent(segment.slice(equals + 1).trim());
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function bearerToken(req: VercelRequest): string | undefined {
  const authorization = headerValue(req, "authorization");
  if (!authorization) return undefined;
  const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(authorization);
  return match?.[1];
}

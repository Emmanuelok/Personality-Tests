export class ValidationError extends Error {
  constructor(
    public readonly code: string,
    public readonly field?: string,
  ) {
    super(code);
    this.name = "ValidationError";
  }
}

export type JsonObject = Record<string, unknown>;

export function isPlainObject(value: unknown): value is JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function objectValue(value: unknown, field = "body"): JsonObject {
  if (!isPlainObject(value)) throw new ValidationError("invalid_object", field);
  return value;
}

export function exactKeys(
  value: JsonObject,
  allowed: readonly string[],
  required: readonly string[] = [],
  field = "body",
): void {
  const allow = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allow.has(key)) throw new ValidationError("unknown_field", `${field}.${key}`);
  }
  for (const key of required) {
    if (!(key in value)) throw new ValidationError("missing_field", `${field}.${key}`);
  }
}

export function stringValue(
  value: unknown,
  field: string,
  options: {
    min?: number;
    max: number;
    pattern?: RegExp;
    trim?: boolean;
  },
): string {
  if (typeof value !== "string") throw new ValidationError("invalid_string", field);
  const parsed = options.trim === false ? value : value.trim();
  if (parsed.length < (options.min ?? 0) || parsed.length > options.max) {
    throw new ValidationError("invalid_length", field);
  }
  if (options.pattern && !options.pattern.test(parsed)) {
    throw new ValidationError("invalid_format", field);
  }
  return parsed;
}

export function optionalString(
  value: unknown,
  field: string,
  options: { min?: number; max: number; pattern?: RegExp; trim?: boolean },
): string | undefined {
  if (value === undefined) return undefined;
  return stringValue(value, field, options);
}

export function finiteNumber(
  value: unknown,
  field: string,
  options: { min: number; max: number; integer?: boolean },
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ValidationError("invalid_number", field);
  }
  if (value < options.min || value > options.max || (options.integer && !Number.isInteger(value))) {
    throw new ValidationError("number_out_of_range", field);
  }
  return value;
}

export function stringArray(
  value: unknown,
  field: string,
  options: { maxItems: number; itemMax: number; itemMin?: number },
): string[] {
  if (!Array.isArray(value) || value.length > options.maxItems) {
    throw new ValidationError("invalid_array", field);
  }
  return value.map((item, index) =>
    stringValue(item, `${field}.${index}`, {
      min: options.itemMin ?? 1,
      max: options.itemMax,
    }),
  );
}

export function singleQueryValue(value: unknown, field: string, max: number): string {
  if (Array.isArray(value)) throw new ValidationError("duplicate_query_parameter", field);
  return stringValue(value, field, { min: 1, max });
}

export function assertOnlyQueryKeys(
  query: Record<string, string | string[] | undefined>,
  allowed: readonly string[],
): void {
  const allow = new Set(allowed);
  for (const key of Object.keys(query)) {
    if (!allow.has(key)) throw new ValidationError("unknown_query_parameter", key);
  }
}

/** Current random result ID plus the two formats retained for saved results. */
export const FINGERPRINT_PATTERN =
  /^(?:(?:rid1_|fp1_)[a-f0-9]{64}|[a-f0-9]{14})$/;
export const STRIPE_SESSION_PATTERN = /^cs_(?:test|live)_[A-Za-z0-9]{8,240}$/;
export const STRIPE_ID_PATTERN = /^(?:evt|pi|ch|dp|re|cs_(?:test|live))_[A-Za-z0-9_]{6,240}$/;
export const CATALOG_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export function fingerprintValue(value: unknown, field = "fingerprint"): string {
  return stringValue(value, field, {
    min: 14,
    max: 69,
    pattern: FINGERPRINT_PATTERN,
    trim: false,
  });
}

export function isProductionRuntime(): boolean {
  return process.env.VERCEL_ENV === "production" ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");
}

/**
 * Demo responses are intentionally limited to local development and tests.
 * Preview deployments are not treated as demos: they must be configured like a
 * real deployment before they can exercise paid or provider-backed flows.
 */
export function isDemoRuntime(): boolean {
  return process.env.VERCEL_ENV === "development" ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV !== "production");
}

export class ConfigurationError extends Error {
  constructor(public readonly setting: string) {
    super(`Missing or invalid server setting: ${setting}`);
    this.name = "ConfigurationError";
  }
}

export function secretFromEnv(name: string, minimumBytes = 32): string {
  const value = process.env[name];
  if (!value || Buffer.byteLength(value, "utf8") < minimumBytes) {
    throw new ConfigurationError(name);
  }
  return value;
}

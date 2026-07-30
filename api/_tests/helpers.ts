import type { VercelRequest, VercelResponse } from "../_vercel-types";

export interface CapturedResponse {
  statusCode: number;
  body: unknown;
  headers: Record<string, string | string[] | number>;
}

export function request(
  overrides: Partial<VercelRequest> & {
    headers?: VercelRequest["headers"];
    query?: VercelRequest["query"];
  } = {},
): VercelRequest {
  return {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-vercel-forwarded-for": "203.0.113.10",
    },
    query: {},
    body: {},
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  } as unknown as VercelRequest;
}

export function response(): {
  res: VercelResponse;
  captured: CapturedResponse;
} {
  const captured: CapturedResponse = {
    statusCode: 200,
    body: undefined,
    headers: {},
  };
  const res = {
    setHeader(name: string, value: string | string[] | number) {
      captured.headers[name] = value;
      return this;
    },
    getHeader(name: string) {
      return captured.headers[name];
    },
    status(code: number) {
      captured.statusCode = code;
      return this;
    },
    json(body: unknown) {
      captured.body = body;
      return this;
    },
    end(body?: unknown) {
      captured.body = body;
      return this;
    },
  } as unknown as VercelResponse;
  return { res, captured };
}

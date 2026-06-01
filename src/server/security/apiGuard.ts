import type { IncomingMessage, ServerResponse } from "node:http";
import { json } from "../api-utils";
import { clientRateLimitKey, rateLimit } from "./rateLimit";

export function applyRateLimit(req: IncomingMessage, res: ServerResponse): boolean {
  const key = `${clientRateLimitKey(req)}:${req.url?.split("?")[0] ?? "/"}`;
  const result = rateLimit(key);
  if (!result.allowed) {
    res.setHeader("Retry-After", String(result.retryAfterSec ?? 60));
    json(res, 429, { error: "Too many requests. Please slow down." });
    return false;
  }
  return true;
}

const MODULE_ID_RE = /^module-\d+$/;

export function isValidModuleId(id: unknown): id is string {
  return typeof id === "string" && MODULE_ID_RE.test(id) && id.length <= 32;
}

export function sanitizeModuleIdPayload(moduleId: unknown): string | null {
  if (!isValidModuleId(moduleId)) return null;
  return moduleId;
}

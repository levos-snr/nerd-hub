import { clientRateLimitKey, rateLimit } from "./rateLimit";

export function applyRateLimit(request: Request): Response | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const key = `${clientRateLimitKey({ headers: { "x-forwarded-for": ip } })}:${new URL(request.url).pathname}`;
  const result = rateLimit(key);
  if (!result.allowed) {
    return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSec ?? 60),
      },
    });
  }
  return null;
}

const MODULE_ID_RE = /^module-\d+$/;

export function isValidModuleId(id: unknown): id is string {
  return typeof id === "string" && MODULE_ID_RE.test(id) && id.length <= 32;
}

export function sanitizeModuleIdPayload(moduleId: unknown): string | null {
  if (!isValidModuleId(moduleId)) return null;
  return moduleId;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;

export function rateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export function clientRateLimitKey(req: { socket?: { remoteAddress?: string | null }; headers?: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers?.["x-forwarded-for"];
  const ip =
    (typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : undefined) ??
    req.socket?.remoteAddress ??
    "unknown";
  return ip;
}

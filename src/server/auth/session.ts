import { createHash } from "node:crypto";
import { DbUnavailableError, isTransientDbError, withDbRetry } from "../db/retry";

async function getAuth() {
  const { auth } = await import("../../features/auth/auth.server");
  return auth;
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type SessionCacheEntry = { user: SessionUser; expiresAt: number };
const SESSION_CACHE_MS = 15_000;
const sessionCache = new Map<string, SessionCacheEntry>();

function sessionCacheKey(headers: Headers): string | null {
  const cookie = headers.get("cookie");
  if (!cookie) return null;
  const match = /better-auth\.session_token=([^;]+)/.exec(cookie);
  if (!match?.[1]) return null;
  return createHash("sha256").update(match[1]).digest("hex");
}

function readCachedSession(key: string | null): SessionUser | null | undefined {
  if (!key) return undefined;
  const hit = sessionCache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt <= Date.now()) {
    sessionCache.delete(key);
    return undefined;
  }
  return hit.user;
}

function writeCachedSession(key: string | null, user: SessionUser | null) {
  if (!key || !user) return;
  sessionCache.set(key, { user, expiresAt: Date.now() + SESSION_CACHE_MS });
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const cacheKey = sessionCacheKey(request.headers);
  const cached = readCachedSession(cacheKey);
  if (cached !== undefined) return cached;
  try {
    const user = await withDbRetry(async () => {
      const auth = await getAuth();
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) return null;
      const role = (session.user as { role?: string }).role ?? "learner";
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role,
      };
    });
    writeCachedSession(cacheKey, user);
    return user;
  } catch (error) {
    if (isTransientDbError(error)) {
      throw new DbUnavailableError();
    }
    return null;
  }
}

export function requireAdmin(user: SessionUser | null): user is SessionUser {
  return Boolean(user && (user.role === "admin" || user.role === "owner"));
}

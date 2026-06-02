import type { AuthUser } from "./client";

export type SessionFetchResult =
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" }
  | { status: "unavailable"; error?: string };

const SESSION_URL = "/api/auth/get-session";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isHtmlResponse(response: Response, text: string): boolean {
  const ct = response.headers.get("content-type") ?? "";
  return (
    ct.includes("text/html") ||
    text.trimStart().startsWith("<!DOCTYPE") ||
    text.trimStart().startsWith("<html")
  );
}

async function fetchSessionOnce(): Promise<SessionFetchResult> {
  try {
    const response = await fetch(SESSION_URL, { credentials: "include" });
    if (response.status === 401 || response.status === 404) {
      return { status: "unauthenticated" };
    }

    const text = await response.text();
    if (isHtmlResponse(response, text)) {
      return { status: "unavailable", error: "Auth API returned HTML" };
    }

    if (!response.ok) {
      return {
        status: "unavailable",
        error: text.slice(0, 200) || `HTTP ${response.status}`,
      };
    }

    const data = JSON.parse(text) as { user?: AuthUser | null };
    if (!data.user) return { status: "unauthenticated" };
    return { status: "authenticated", user: data.user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { status: "unavailable", error: message };
  }
}

/** Retries only when the session service or database is temporarily unreachable. */
export async function fetchSessionWithRetry(maxAttempts = 3): Promise<SessionFetchResult> {
  let last: SessionFetchResult = { status: "unavailable" };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    last = await fetchSessionOnce();
    if (last.status !== "unavailable") return last;
    if (attempt < maxAttempts - 1) {
      await sleep(150 * (attempt + 1));
    }
  }

  return last;
}

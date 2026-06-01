import { fetchSessionWithRetry } from "./session-fetch";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

function mapAuthError(status: number, body: string): string {
  const lower = body.toLowerCase();
  if (
    lower.includes("etimedout") ||
    lower.includes("econnrefused") ||
    lower.includes("cannot reach database") ||
    lower.includes("drizzlequeryerror") ||
    lower.includes("failed query")
  ) {
    return "Cannot reach the database. Check DATABASE_URL, run pnpm db:migrate, and try GET /api/health.";
  }
  if (status === 422 && (lower.includes("already") || lower.includes("exists"))) {
    return "An account with this email already exists. Try signing in.";
  }
  if (status === 401 || lower.includes("invalid") || lower.includes("credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("server_error") || status >= 500) {
    return "Server error. Check database connection and auth configuration.";
  }
  return body || `Request failed (${status})`;
}

function isHtmlResponse(response: Response, text: string): boolean {
  const ct = response.headers.get("content-type") ?? "";
  return ct.includes("text/html") || text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html");
}

async function parseResponse(response: Response): Promise<void> {
  const text = await response.text();
  if (isHtmlResponse(response, text)) {
    throw new Error(
      response.status === 404
        ? "Auth API is unavailable (404). Restart the dev server after pulling latest changes."
        : "Auth API returned an unexpected HTML response. Check server logs and GET /api/health.",
    );
  }
  let data: { message?: string; error?: string; code?: string } = {};
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    data = { message: text.slice(0, 200) };
  }
  if (!response.ok) {
    const raw = data.message ?? data.error ?? data.code ?? text;
    throw new Error(mapAuthError(response.status, raw));
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const result = await fetchSessionWithRetry();
  if (result.status === "authenticated") return result.user;
  return null;
}

export async function signUp(name: string, email: string, password: string): Promise<void> {
  const response = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });
  await parseResponse(response);
}

export async function signIn(email: string, password: string): Promise<void> {
  const response = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  await parseResponse(response);
}

export async function signOut(): Promise<void> {
  const response = await fetch("/api/auth/sign-out", {
    method: "POST",
    headers: { "content-type": "application/json" }, 
    body: JSON.stringify({}),                          
    credentials: "include",
  });
  await parseResponse(response);
}

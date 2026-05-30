export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string };
  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export async function getSession(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/get-session", { credentials: "include" });
  if (response.status === 401) return null;
  const data = await response.json().catch(() => null) as { user?: AuthUser } | null;
  return data?.user ?? null;
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
    credentials: "include",
  });
  await parseResponse(response);
}

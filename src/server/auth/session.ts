import type { IncomingMessage } from "node:http";
import { auth } from "../../features/auth/auth.server";
import { toHeaders } from "../api-utils";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function getSessionUser(req: IncomingMessage): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: toHeaders(req) });
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role ?? "learner";
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role,
  };
}

export function requireAdmin(user: SessionUser | null): user is SessionUser {
  return Boolean(user && (user.role === "admin" || user.role === "owner"));
}

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "../features/auth/client";
import { fetchSessionWithRetry } from "../features/auth/session-fetch";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setSessionError(null);
    try {
      const result = await fetchSessionWithRetry();
      if (result.status === "authenticated") {
        setUser(result.user);
        return;
      }
      if (result.status === "unauthenticated") {
        setUser(null);
        return;
      }
      setSessionError(result.error ?? "Could not verify session");
      setUser((prev) => prev);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, sessionError, refresh }),
    [user, loading, sessionError, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

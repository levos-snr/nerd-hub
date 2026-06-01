import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";

type Props = {
  children: ReactNode;
  redirectTo?: string;
};

export function GuestOnlyGate({ children, redirectTo = "/dashboard" }: Props) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: redirectTo });
    }
  }, [loading, navigate, redirectTo, user]);

  if (loading || user) {
    return (
      <main className="mx-auto max-w-lg p-8 text-center text-sm text-[var(--muted)]">
        Redirecting…
      </main>
    );
  }

  return <>{children}</>;
}

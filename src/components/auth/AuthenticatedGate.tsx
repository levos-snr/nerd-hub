import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";

type Props = {
  children: ReactNode;
  adminOnly?: boolean;
};

export function AuthenticatedGate({ children, adminOnly = false }: Props) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({
        to: "/signin",
        search: { redirect: pathname },
      });
      return;
    }
    if (adminOnly && user.role !== "admin" && user.role !== "owner") {
      void navigate({ to: "/dashboard" });
    }
  }, [adminOnly, loading, navigate, pathname, user]);

  if (loading) {
    return (
      <main className="mx-auto max-w-lg p-8 text-center text-sm text-[var(--muted)]">
        Checking your session…
      </main>
    );
  }

  if (!user) return null;
  if (adminOnly && user.role !== "admin" && user.role !== "owner") return null;

  return <>{children}</>;
}

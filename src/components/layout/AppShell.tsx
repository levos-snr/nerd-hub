import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

type Props = {
  user: { name: string; email: string; role?: string } | null;
  children: ReactNode;
  variant?: "marketing" | "app";
};

export function AppShell({ user, children, variant = "app" }: Props) {
  if (variant === "marketing" || !user) {
    return (
      <div className="mx-auto min-h-screen max-w-7xl px-4 pb-10 pt-4 md:px-6">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  );
}

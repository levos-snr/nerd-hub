import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

type Props = {
  user: { name: string; email: string; role?: string } | null;
  children: ReactNode;
};

export function AppShell({ user, children }: Props) {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 pb-10 pt-4 md:px-6">
      <AppHeader user={user} />
      {children}
    </div>
  );
}

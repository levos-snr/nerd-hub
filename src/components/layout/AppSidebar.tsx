import { Link, useRouterState } from "@tanstack/react-router";
import { Code2, LayoutDashboard, BookOpen, LogOut, Shield } from "lucide-react";
import { signOut } from "../../features/auth/client";

type Props = {
  user: { name: string; email: string; role?: string } | null;
};

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "My courses", icon: BookOpen },
] as const;

export function AppSidebar({ user }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="sidebar flex w-[240px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <Link to="/" className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-5 font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-black">
          <Code2 size={20} />
        </span>
        <span>NerdStack</span>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={`sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? "sidebar-link-active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
        {(user?.role === "admin" || user?.role === "owner") ? (
          <Link
            to="/admin"
            className={`sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname === "/admin" ? "sidebar-link-active" : ""}`}
          >
            <Shield size={18} />
            Admin
          </Link>
        ) : null}
      </nav>

      <div className="border-t border-[var(--border)] p-3 text-sm">
        <p className="mb-2 truncate px-3 text-[var(--muted)]">{user?.email}</p>
        <button
          type="button"
          className="sidebar-link flex w-full items-center gap-2 rounded-lg px-3 py-2"
          onClick={() => void signOut().then(() => window.location.assign("/signin"))}
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}

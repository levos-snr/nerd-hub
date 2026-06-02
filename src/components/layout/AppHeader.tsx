import { Link } from "@tanstack/react-router";
import { signOut } from "../../features/auth/client";

type Props = {
  user: { name: string; email: string; role?: string } | null;
};

export function AppHeader({ user }: Props) {
  return (
    <header className="glass sticky top-0 z-40 mb-6 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-lg font-bold tracking-tight">
          NerdStack Academy
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-[var(--muted)] md:flex">
          <Link to="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link to="/learn" className="hover:text-white">
            Learn
          </Link>
          {user?.role === "admin" || user?.role === "owner" ? (
            <Link to="/admin" className="hover:text-white">
              Admin
            </Link>
          ) : null}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden text-sm text-[var(--muted)] sm:inline">{user.email}</span>
            <button
              className="btn btn-ghost"
              onClick={() => void signOut().then(() => window.location.assign("/signin"))}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className="btn btn-ghost">
              Sign in
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Start free
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

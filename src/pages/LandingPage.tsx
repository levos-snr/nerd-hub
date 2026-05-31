import { Link } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../hooks/useAuth";

export function LandingPage() {
  const { user } = useAuth();

  return (
    <AppShell user={user} variant="marketing">
      <section className="grid gap-8 py-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="badge mb-3">Mixed JS + TS syllabus</p>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            Learn JavaScript and TypeScript together, from beginner to pro.
          </h1>
          <p className="mb-6 max-w-xl text-[var(--muted)]">
            A modern LMS with real lessons, quizzes, coding challenges, XP progression, and admin-managed curriculum.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className="btn btn-primary">Start learning</Link>
            <Link to="/dashboard" className="btn btn-ghost">Open dashboard</Link>
          </div>
        </div>
        <div className="glass p-6">
          <h2 className="mb-3 text-xl font-semibold">Why this platform</h2>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>Interleaved JS/TS path so concepts connect faster</li>
            <li>Pass quizzes to unlock the next module</li>
            <li>Production stack: TanStack, Better Auth, Neon, Vercel</li>
            <li>Admin CRUD for curriculum management</li>
          </ul>
        </div>
      </section>
    </AppShell>
  );
}

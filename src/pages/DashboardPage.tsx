import { Link } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { useModules } from "../db/collections/useModules";
import { useProgress } from "../db/collections/useProgress";
import { useAuth } from "../providers/AuthProvider";

export function DashboardPage() {
  const { user } = useAuth();
  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: state, isLoading: progressLoading } = useProgress(Boolean(user));

  const completed = state?.completedModuleIds.length ?? 0;
  const total = modules.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <AppShell user={user}>
      <section className="mb-6">
        <h1 className="text-3xl font-bold">Your dashboard</h1>
        <p className="text-[var(--muted)]">Track XP, streak, and module completion in one place.</p>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="stat-card"><p className="text-sm text-[var(--muted)]">XP</p><p className="text-2xl font-bold">{progressLoading ? "…" : state?.xp ?? 0}</p></article>
        <article className="stat-card"><p className="text-sm text-[var(--muted)]">Level</p><p className="text-2xl font-bold">{progressLoading ? "…" : state?.level ?? 1}</p></article>
        <article className="stat-card"><p className="text-sm text-[var(--muted)]">Streak</p><p className="text-2xl font-bold">{progressLoading ? "…" : state?.streak ?? 0}</p></article>
        <article className="stat-card"><p className="text-sm text-[var(--muted)]">Modules</p><p className="text-2xl font-bold">{modulesLoading ? "…" : total}</p></article>
      </section>

      <section className="glass mb-6 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Course progress</h2>
          <span className="badge">{progressPct}% complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#1b2740]">
          <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-2)]" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">{completed} of {total || "—"} modules passed</p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link to="/learn" className="btn btn-primary">Continue learning</Link>
        {(user?.role === "admin" || user?.role === "owner") ? <Link to="/admin" className="btn btn-ghost">Admin panel</Link> : null}
      </section>
    </AppShell>
  );
}

import { Link } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { ContinueCard } from "../components/dashboard/ContinueCard";
import { HeroStats } from "../components/dashboard/HeroStats";
import { ProgressRing } from "../components/dashboard/ProgressRing";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { StreakFlame } from "../components/dashboard/StreakFlame";
import { useModules } from "../db/collections/useModules";
import { useProgress } from "../db/collections/useProgress";
import {
  getResumeModuleId,
  getStartModuleId,
  hasLearningActivity,
} from "../features/curriculum/navigation";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();
  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: state, isLoading: progressLoading } = useProgress(Boolean(user));

  const completed = state?.completedModuleIds ?? [];
  const total = modules.length;
  const progressPct = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  const started = hasLearningActivity(state);
  const resumeId = getResumeModuleId(modules, completed, state?.lastVisitedModuleId, state);
  const startId = getStartModuleId(modules, completed);
  const targetId = started ? resumeId : startId;
  const targetModule = modules.find((m) => m.id === targetId);

  const recent = Object.entries(state?.progress ?? {})
    .map(([moduleId, record]) => ({ moduleId, record }))
    .sort((a, b) => b.record.attempts - a.record.attempts)
    .slice(0, 3);

  const loading = modulesLoading || progressLoading;

  return (
    <AppShell user={user}>
      <section className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-[var(--muted)]">
          {started ? "Pick up where you left off." : "Welcome! Start your first module when you're ready."}
        </p>
      </section>

      <div className="mb-8">
        <HeroStats
          loading={loading}
          stats={[
            { label: "XP", value: state?.xp ?? 0, accent: "text-indigo-200" },
            { label: "Level", value: state?.level ?? 1 },
            { label: "Day streak", value: state?.streak ?? 0, accent: "text-[var(--accent)]" },
            { label: "Modules", value: total },
          ]}
        />
      </div>

      <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        {targetModule ? (
          <ContinueCard
            moduleId={targetModule.id}
            moduleTitle={targetModule.title}
            track={targetModule.track}
            ctaLabel={started ? "Resume module" : "Start learning"}
          />
        ) : (
          <div className="glass p-6">
            <h2 className="text-lg font-semibold">Course complete</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">You finished all available modules.</p>
          </div>
        )}

        <div className="glass flex flex-col items-center justify-center p-6">
          <ProgressRing percent={progressPct} />
          <p className="mt-3 text-center text-sm text-[var(--muted)]">
            {completed.length} of {total || "—"} passed
          </p>
        </div>
      </section>

      {started ? (
        <section className="glass mb-6 grid gap-6 p-6 md:grid-cols-2">
          <StreakFlame streak={state?.streak ?? 0} />
          <div>
            <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
            <RecentActivity records={recent} />
          </div>
        </section>
      ) : null}

      <section className="flex flex-wrap gap-3">
        {targetId ? (
          <Link to="/learn/$moduleId" params={{ moduleId: targetId }} className="btn btn-primary">
            {started ? "Continue learning" : "Start first module"}
          </Link>
        ) : null}
        <Link to="/learn" className="btn btn-ghost">Browse all courses</Link>
        {(user?.role === "admin" || user?.role === "owner") ? (
          <Link to="/admin" className="btn btn-ghost">Admin</Link>
        ) : null}
      </section>
    </AppShell>
  );
}

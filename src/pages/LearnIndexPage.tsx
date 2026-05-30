import { Link } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { useModules } from "../db/collections/useModules";
import { useProgress } from "../db/collections/useProgress";
import { canUnlockModule } from "../features/gamification/engine";
import { useAuth } from "../providers/AuthProvider";
import { useMemo, useState } from "react";

export function LearnIndexPage() {
  const { user } = useAuth();
  const { data: modules = [] } = useModules();
  const { data: state } = useProgress(Boolean(user));
  const [trackFilter, setTrackFilter] = useState<"all" | "javascript" | "typescript">("all");

  const visibleModules = useMemo(() => {
    if (trackFilter === "all") return modules;
    return modules.filter((m) => m.track === trackFilter);
  }, [modules, trackFilter]);

  const completed = state?.completedModuleIds ?? [];

  return (
    <AppShell user={user}>
      <h1 className="mb-2 text-3xl font-bold">Learning path</h1>
      <p className="mb-4 text-[var(--muted)]">Mixed JavaScript + TypeScript syllabus from beginner to pro.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "javascript", "typescript"] as const).map((track) => (
          <button
            key={track}
            className={`btn ${trackFilter === track ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTrackFilter(track)}
          >
            {track}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {visibleModules.map((module) => {
          const unlocked = canUnlockModule(module, completed);
          const passed = completed.includes(module.id);
          return (
            <Link
              key={module.id}
              to="/learn/$moduleId"
              params={{ moduleId: module.id }}
              className={`glass block p-4 transition ${unlocked ? "hover:border-[var(--primary)]" : "pointer-events-none opacity-45"}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <h2 className="font-semibold">{module.title}</h2>
                <span className="badge">{passed ? "passed" : unlocked ? "open" : "locked"}</span>
              </div>
              <p className="text-sm text-[var(--muted)]">{module.track} • {module.difficulty}</p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

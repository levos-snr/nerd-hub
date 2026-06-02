import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { useModules } from "../db/collections/useModules";
import { useProgress } from "../db/collections/useProgress";
import { canUnlockModule } from "../features/gamification/engine";
import { useAuth } from "../hooks/useAuth";

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
  const jsCount = modules.filter((m) => m.track === "javascript").length;
  const tsCount = modules.filter((m) => m.track === "typescript").length;

  return (
    <AppShell user={user}>
      <header className="course-header mb-8">
        <p className="badge mb-2">W3Schools-aligned syllabus</p>
        <h1 className="mb-2 text-3xl font-bold uppercase tracking-tight">
          JavaScript & TypeScript
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Real lessons, coding tasks with automated tests, and quizzes — structured like W3Schools
          JS/TS tutorials.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <span>{jsCount} JS modules</span>
          <span>{tsCount} TS modules</span>
          <span>{completed.length} completed</span>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "javascript", "typescript"] as const).map((track) => (
          <button
            key={track}
            type="button"
            className={`btn ${trackFilter === track ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTrackFilter(track)}
          >
            {track === "all" ? "All courses" : track}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visibleModules.map((module, index) => {
          const unlocked = canUnlockModule(module, completed);
          const passed = completed.includes(module.id);
          return (
            <div
              key={module.id}
              className={`lesson-row flex items-center gap-4 rounded-xl border border-[var(--border)] p-4 ${unlocked ? "bg-[var(--surface-2)]" : "opacity-50"}`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1a2030] text-xs font-bold text-[var(--muted)]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{module.title}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {module.track} • {module.difficulty}
                </p>
              </div>
              <span className="badge shrink-0">
                {passed ? "Done" : unlocked ? "Open" : "Locked"}
              </span>
              {unlocked ? (
                <Link
                  to="/learn/$moduleId"
                  params={{ moduleId: module.id }}
                  className="play-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-black"
                  aria-label={`Open ${module.title}`}
                >
                  <Play size={16} fill="currentColor" />
                </Link>
              ) : (
                <span className="h-10 w-10 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

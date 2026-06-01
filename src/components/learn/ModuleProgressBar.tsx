import { Link } from "@tanstack/react-router";

type Props = {
  moduleIndex: number;
  totalModules: number;
  lessonDone: boolean;
  taskDone: boolean;
  quizDone: boolean;
};

export function ModuleProgressBar({ moduleIndex, totalModules, lessonDone, taskDone, quizDone }: Props) {
  const coursePct = totalModules > 0 ? Math.round((moduleIndex / totalModules) * 100) : 0;
  const steps = [
    { label: "Lesson", done: lessonDone },
    { label: "Task", done: taskDone },
    { label: "Quiz", done: quizDone },
  ];
  const stepPct = Math.round(
    ((lessonDone ? 1 : 0) + (taskDone ? 1 : 0) + (quizDone ? 1 : 0)) / 3 * 100
  );

  return (
    <div className="module-progress mb-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link to="/learn" className="text-[var(--accent)] hover:underline">
          ← All courses
        </Link>
        <span className="text-[var(--muted)]">
          Module {moduleIndex} of {totalModules} ({coursePct}% through path)
        </span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-[#1a1d26]">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-500"
          style={{ width: `${stepPct}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {steps.map((s) => (
          <span
            key={s.label}
            className={`rounded-full px-2 py-1 ${s.done ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--surface-2)] text-[var(--muted)]"}`}
          >
            {s.done ? "✓ " : ""}
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

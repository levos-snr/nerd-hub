import type { Module } from "../../features/curriculum/types";

type Props = {
  module: Module;
};

export function BeginnerGuide({ module }: Props) {
  const isBeginner = module.difficulty === "beginner";
  const clue = module.lesson.clue ?? module.challenge.hint;

  if (!isBeginner && !clue) return null;

  return (
    <aside className="beginner-guide mb-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
      <p className="mb-2 text-sm font-semibold text-[var(--accent)]">Beginner guide</p>
      {clue ? <p className="mb-3 text-sm text-[var(--muted)]">{clue}</p> : null}
      {module.lesson.example ? (
        <>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Worked example
          </p>
          <pre className="lesson-example text-xs">{module.lesson.example}</pre>
        </>
      ) : null}
      {module.challenge.tests.length > 0 ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Your function must pass {module.challenge.tests.length} test
          {module.challenge.tests.length === 1 ? "" : "s"}:{" "}
          {module.challenge.tests.map((t) => t.label).join(", ")}.
        </p>
      ) : null}
    </aside>
  );
}

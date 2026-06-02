import type { ProgressRecord } from "../../features/gamification/engine";

export function RecentActivity({
  records,
}: {
  records: Array<{ moduleId: string; record: ProgressRecord }>;
}) {
  if (records.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No quiz attempts yet. Start a module!</p>;
  }

  return (
    <ul className="space-y-2 text-sm">
      {records.map(({ moduleId, record }) => (
        <li
          key={moduleId}
          className="flex justify-between rounded-lg border border-[var(--border)] px-3 py-2"
        >
          <span>{moduleId}</span>
          <span className={record.passed ? "text-emerald-300" : "text-[var(--muted)]"}>
            Best {record.bestScore}% • {record.attempts} attempt{record.attempts === 1 ? "" : "s"}
          </span>
        </li>
      ))}
    </ul>
  );
}

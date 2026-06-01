import { useEffect, useRef } from "react";

export type TestLogEntry = {
  id: string;
  time: string;
  type: "info" | "pass" | "fail" | "run";
  message: string;
};

type Props = {
  logs: TestLogEntry[];
};

export function TestConsole({ logs }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="test-console" aria-live="polite">
      <p className="test-console-title">Test output</p>
      <div className="test-console-body">
        {logs.length === 0 ? (
          <p className="text-[var(--muted)]">Run tests to see results here.</p>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className={`test-log test-log-${entry.type}`}>
              <span className="test-log-time">{entry.time}</span>
              <span>{entry.message}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

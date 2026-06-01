import { useEffect, useState } from "react";
import { LoadingButton } from "../ui/LoadingButton";
import { runChallenge } from "../../features/assessment/runChallenge";
import type { Challenge } from "../../features/curriculum/types";
import { TestConsole, type TestLogEntry } from "./TestConsole";

export type { TestLogEntry };

type Tab = "lesson" | "task" | "quiz";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function newLog(type: TestLogEntry["type"], message: string): TestLogEntry {
  return { id: crypto.randomUUID(), time: nowTime(), type, message };
}

type Props = {
  moduleId: string;
  challenge: Challenge;
  challengeDone: boolean;
  onSaveChallenge: () => Promise<void>;
  lessonPanel: React.ReactNode;
  quizPanel: React.ReactNode;
};

export function CodeWorkspace({
  moduleId,
  challenge,
  challengeDone,
  onSaveChallenge,
  lessonPanel,
  quizPanel,
}: Props) {
  const [tab, setTab] = useState<Tab>("lesson");
  const [code, setCode] = useState(challenge.starterCode);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<TestLogEntry[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTab("lesson");
    setCode(challenge.starterCode);
    setLogs([newLog("info", `Module ${moduleId} loaded — write solve() and run tests.`)]);
    setMessage("");
    setRunning(false);
    setSaving(false);
  }, [moduleId, challenge.starterCode]);

  async function handleRun() {
    setRunning(true);
    setMessage("");
    setLogs((prev) => [...prev, newLog("run", `Running ${challenge.tests.length} test(s)…`)]);
    try {
      const out = runChallenge(code, challenge.tests, challenge.language);
      const nextLogs = out.results.map((r) =>
        newLog(
          r.passed ? "pass" : "fail",
          `${r.label}: ${r.passed ? "PASSED" : "FAILED"} — ${r.message}`
        )
      );
      setLogs((prev) => [...prev, ...nextLogs]);
      setMessage(
        out.passed
          ? "All tests passed! Submit to unlock the quiz."
          : `${out.results.filter((r) => !r.passed).length} test(s) failed.`
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Run failed";
      setLogs((prev) => [...prev, newLog("fail", msg)]);
      setMessage(msg);
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmit() {
    setLogs((prev) => [...prev, newLog("run", "Submitting challenge…")]);
    const out = runChallenge(code, challenge.tests, challenge.language);
    if (!out.passed) {
      setMessage("All tests must pass before submitting.");
      setLogs((prev) => [...prev, newLog("fail", "Submit blocked — fix failing tests first.")]);
      return;
    }
    setSaving(true);
    try {
      await onSaveChallenge();
      setMessage("Challenge saved! Quiz tab unlocked.");
      setLogs((prev) => [...prev, newLog("pass", "Challenge submitted successfully.")]);
      setTab("quiz");
    } catch {
      setMessage("Could not save — check /api/health and database connection.");
      setLogs((prev) => [...prev, newLog("fail", "Server save failed.")]);
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "lesson", label: "Lesson" },
    { id: "task", label: "Task" },
    { id: "quiz", label: "Quiz", disabled: !challengeDone },
  ];

  return (
    <div className="workspace">
      <div className="workspace-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.disabled}
            className={`workspace-tab ${tab === t.id ? "workspace-tab-active" : ""}`}
            onClick={() => !t.disabled && setTab(t.id)}
          >
            {t.label}
            {t.id === "task" && challengeDone ? " ✓" : ""}
          </button>
        ))}
      </div>

      <div className="workspace-body">
        <div className="workspace-left">
          {tab === "lesson" ? lessonPanel : null}
          {tab === "task" ? (
            <div className="p-4">
              <p className="mb-3 text-sm text-[var(--muted)]">{challenge.prompt}</p>
              {challenge.hint ? (
                <p className="mb-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-2 text-xs text-[var(--accent)]">
                  Clue: {challenge.hint}
                </p>
              ) : null}
            </div>
          ) : null}
          {tab === "quiz" ? quizPanel : null}
        </div>

        <div className="workspace-editor">
          <div className="editor-toolbar">
            <span className="badge">{challenge.language}</span>
            <span className="text-xs text-[var(--muted)]">Edit solve() below</span>
          </div>
          <textarea
            className="editor-area"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            aria-label="Code editor"
          />
          <div className="editor-actions">
            <LoadingButton variant="ghost" loading={running} loadingLabel="Running tests…" onClick={() => void handleRun()}>
              Run tests
            </LoadingButton>
            <LoadingButton loading={saving} loadingLabel="Submitting…" onClick={() => void handleSubmit()}>
              Submit
            </LoadingButton>
          </div>
          <TestConsole logs={logs} />
          {message ? <p className="editor-message">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}

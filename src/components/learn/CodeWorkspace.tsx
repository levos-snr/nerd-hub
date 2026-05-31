import { useState } from "react";
import { LoadingButton } from "../ui/LoadingButton";
import { runChallenge } from "../../features/assessment/runChallenge";
import type { Challenge } from "../../features/curriculum/types";

type Tab = "lesson" | "task" | "quiz";

type Props = {
  challenge: Challenge;
  code: string;
  onCodeChange: (code: string) => void;
  challengeDone: boolean;
  onSaveChallenge: () => Promise<void>;
  lessonPanel: React.ReactNode;
  quizPanel: React.ReactNode;
};

export function CodeWorkspace({
  challenge,
  code,
  onCodeChange,
  challengeDone,
  onSaveChallenge,
  lessonPanel,
  quizPanel,
}: Props) {
  const [tab, setTab] = useState<Tab>("lesson");
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<Array<{ label: string; passed: boolean; message: string }> | null>(null);
  const [message, setMessage] = useState("");

  async function handleRun() {
    setRunning(true);
    setResults(null);
    setMessage("");
    try {
      const out = runChallenge(code, challenge.tests, challenge.language);
      setResults(out.results);
      setMessage(out.passed ? "All tests passed! Submit to unlock the quiz." : "Fix failing tests below.");
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmit() {
    const out = runChallenge(code, challenge.tests, challenge.language);
    if (!out.passed) {
      setResults(out.results);
      setMessage("All tests must pass before submitting.");
      return;
    }
    setSaving(true);
    try {
      await onSaveChallenge();
      setMessage("Challenge saved! Quiz tab unlocked.");
      setTab("quiz");
    } catch {
      setMessage("Could not save — check database connection (/api/health).");
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
              {challenge.hint ? <p className="mb-2 text-xs text-[var(--accent)]">Hint: {challenge.hint}</p> : null}
            </div>
          ) : null}
          {tab === "quiz" ? quizPanel : null}
        </div>

        <div className="workspace-editor">
          <div className="editor-toolbar">
            <span className="badge">{challenge.language}</span>
          </div>
          <textarea
            className="editor-area"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
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
          {results ? (
            <ul className="editor-results">
              {results.map((r) => (
                <li key={r.label} className={r.passed ? "text-[var(--accent)]" : "text-[var(--danger)]"}>
                  {r.label}: {r.message}
                </li>
              ))}
            </ul>
          ) : null}
          {message ? <p className="editor-message">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}

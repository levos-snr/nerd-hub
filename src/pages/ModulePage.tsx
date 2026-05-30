import { useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { useModules } from "../db/collections/useModules";
import { useProgress } from "../db/collections/useProgress";
import { submitQuiz } from "../db/collections/progress";
import { canUnlockModule } from "../features/gamification/engine";
import { useAuth } from "../providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

export function ModulePage() {
  const { moduleId } = useParams({ from: "/learn/$moduleId" });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: modules = [] } = useModules();
  const { data: state, refetch } = useProgress(Boolean(user));
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitMessage, setSubmitMessage] = useState("");

  const module = useMemo(() => modules.find((m) => m.id === moduleId), [modules, moduleId]);
  const completed = state?.completedModuleIds ?? [];
  const unlocked = module ? canUnlockModule(module, completed) : false;

  async function handleSubmitQuiz() {
    if (!module || !user) return;
    const answerList = module.quiz.map((q) => answers[q.id] ?? -1);
    try {
      const result = await submitQuiz(module.id, answerList);
      await queryClient.invalidateQueries({ queryKey: ["progress"] });
      await refetch();
      setSubmitMessage(
        result.passed
          ? `Passed with ${result.score}%. Next module unlocked.`
          : `Score ${result.score}%. Need ${module.passScore}% to unlock next module.`
      );
    } catch {
      setSubmitMessage("Could not submit quiz. Check API/database configuration.");
    }
  }

  if (!module) {
    return (
      <AppShell user={user}>
        <p>Module not found.</p>
        <Link to="/learn" className="btn btn-ghost mt-3 inline-block">Back to modules</Link>
      </AppShell>
    );
  }

  if (!unlocked) {
    return (
      <AppShell user={user}>
        <p className="text-[var(--danger)]">This module is locked. Pass the previous module quiz first.</p>
        <Link to="/learn" className="btn btn-ghost mt-3 inline-block">Back to modules</Link>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <Link to="/learn" className="mb-4 inline-block text-sm text-[var(--muted)] hover:text-white">← All modules</Link>
      <article className="glass p-6">
        <p className="badge mb-2">{module.track} • {module.difficulty}</p>
        <h1 className="mb-3 text-2xl font-bold">{module.title}</h1>
        <p className="mb-4 text-[var(--muted)]">{module.lesson.content}</p>
        <p className="mb-3 text-sm"><strong>Objectives:</strong> {module.lesson.objectives.join(" • ")}</p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-[#0b1220] p-3 text-xs">{module.lesson.example}</pre>
        <p className="mb-2 text-sm text-[var(--muted)]"><strong>Challenge:</strong> {module.challenge.prompt}</p>
        <pre className="mb-6 overflow-x-auto rounded-lg bg-[#0b1220] p-3 text-xs">{module.challenge.starterCode}</pre>

        <h2 className="mb-3 text-lg font-semibold">Quiz ({module.passScore}% required)</h2>
        {module.quiz.map((question) => (
          <fieldset key={question.id} className="mb-3 rounded-lg border border-[var(--border)] p-3">
            <legend className="px-1 text-sm">{question.prompt}</legend>
            {question.options.map((option, index) => (
              <label key={option} className="mb-1 block text-sm">
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === index}
                  onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
                />{" "}
                {option}
              </label>
            ))}
          </fieldset>
        ))}

        <button className="btn btn-primary" onClick={() => void handleSubmitQuiz()}>Submit quiz</button>
        {submitMessage ? <p className="mt-3 text-sm text-indigo-200">{submitMessage}</p> : null}
      </article>
    </AppShell>
  );
}

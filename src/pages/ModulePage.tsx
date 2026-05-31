import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../components/layout/AppShell";
import { CodeWorkspace } from "../components/learn/CodeWorkspace";
import { LoadingButton } from "../components/ui/LoadingButton";
import { useModules } from "../db/collections/useModules";
import { patchProgress, submitChallengePass, submitQuiz } from "../db/collections/progress";
import { useProgress } from "../db/collections/useProgress";
import { getNextModuleId } from "../features/curriculum/navigation";
import { canUnlockModule, isChallengePassed } from "../features/gamification/engine";
import { useAuth } from "../hooks/useAuth";

export function ModulePage() {
  const { moduleId } = useParams({ from: "/learn/$moduleId" });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: modules = [] } = useModules();
  const { data: state, refetch } = useProgress(Boolean(user));
  const visitedRef = useRef(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [code, setCode] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  const module = useMemo(() => modules.find((m) => m.id === moduleId), [modules, moduleId]);
  const completed = state?.completedModuleIds ?? [];
  const unlocked = module ? canUnlockModule(module, completed) : false;
  const challengeDone = module && state ? isChallengePassed(state, module.id) : false;
  const nextModuleId = module ? getNextModuleId(module.id, modules) : null;

  useEffect(() => {
    if (module) setCode(module.challenge.starterCode);
  }, [module]);

  useEffect(() => {
    if (!user || !moduleId || visitedRef.current) return;
    visitedRef.current = true;
    void patchProgress({ lastVisitedModuleId: moduleId })
      .then(() => queryClient.invalidateQueries({ queryKey: ["progress"] }))
      .catch(() => {
        /* DB unavailable — continue locally */
      });
  }, [user, moduleId, queryClient]);

  async function handleSaveChallenge() {
    if (!module) return;
    await submitChallengePass(module.id);
    await queryClient.invalidateQueries({ queryKey: ["progress"] });
    await refetch();
  }

  async function handleSubmitQuiz() {
    if (!module || !user || !challengeDone) return;
    const answerList = module.quiz.map((q) => answers[q.id] ?? -1);
    setQuizSubmitting(true);
    setSubmitMessage("");
    try {
      const result = await submitQuiz(module.id, answerList);
      await queryClient.invalidateQueries({ queryKey: ["progress"] });
      await refetch();
      setQuizPassed(result.passed);
      setSubmitMessage(
        result.passed
          ? `Passed with ${result.score}%.`
          : `Score ${result.score}%. Need ${module.passScore}% to pass.`
      );
    } catch {
      setSubmitMessage("Could not submit quiz. Check /api/health and database.");
    } finally {
      setQuizSubmitting(false);
    }
  }

  if (!module) {
    return (
      <AppShell user={user}>
        <p>Module not found.</p>
        <Link to="/learn" className="btn btn-ghost mt-3 inline-block">Back to courses</Link>
      </AppShell>
    );
  }

  if (!unlocked) {
    return (
      <AppShell user={user}>
        <p className="text-[var(--danger)]">This module is locked. Complete the previous module first.</p>
        <Link to="/learn" className="btn btn-ghost mt-3 inline-block">Back to courses</Link>
      </AppShell>
    );
  }

  const lessonPanel = (
    <div className="p-4">
      <p className="mb-4 text-[var(--muted)]">{module.lesson.content}</p>
      <p className="mb-2 text-sm font-medium">Objectives</p>
      <ul className="mb-4 list-inside list-disc text-sm text-[var(--muted)]">
        {module.lesson.objectives.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
      <pre className="lesson-example">{module.lesson.example}</pre>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Reference:{" "}
        <a
          href={
            module.track === "javascript"
              ? "https://www.w3schools.com/js/"
              : "https://www.w3schools.com/typescript/"
          }
          target="_blank"
          rel="noreferrer"
          className="text-[var(--accent)] underline"
        >
          W3Schools {module.track === "javascript" ? "JavaScript" : "TypeScript"}
        </a>
      </p>
    </div>
  );

  const quizPanel = challengeDone ? (
    <div className="p-4">
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
      <LoadingButton loading={quizSubmitting} loadingLabel="Submitting quiz…" onClick={() => void handleSubmitQuiz()}>
        Submit quiz
      </LoadingButton>
      {submitMessage ? <p className="mt-3 text-sm text-indigo-200">{submitMessage}</p> : null}
      {quizPassed && nextModuleId ? (
        <div className="mt-4 flex gap-3">
          <Link to="/learn/$moduleId" params={{ moduleId: nextModuleId }} className="btn btn-primary">
            Next module →
          </Link>
          <Link to="/learn" className="btn btn-ghost">Course outline</Link>
        </div>
      ) : null}
    </div>
  ) : (
    <p className="p-4 text-sm text-[var(--muted)]">Pass the Task tests and submit to unlock the quiz.</p>
  );

  return (
    <AppShell user={user}>
      <header className="course-header mb-6">
        <Link to="/learn" className="mb-2 inline-block text-sm text-[var(--muted)] hover:text-white">
          ← Courses
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="badge mb-2">{module.track} • {module.difficulty}</p>
            <h1 className="text-2xl font-bold uppercase tracking-tight">{module.title}</h1>
          </div>
        </div>
      </header>

      <CodeWorkspace
        challenge={module.challenge}
        code={code}
        onCodeChange={setCode}
        challengeDone={challengeDone}
        onSaveChallenge={handleSaveChallenge}
        lessonPanel={lessonPanel}
        quizPanel={quizPanel}
      />
    </AppShell>
  );
}

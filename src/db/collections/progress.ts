import type { LearnerState } from "../../features/gamification/engine";

type ApiErrorBody = { error?: string; code?: string; retryable?: boolean };

async function readApiError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => ({}))) as ApiErrorBody;
  if (response.status === 503 && data.code === "DATABASE_UNAVAILABLE") {
    return data.error ?? "Database is busy. Wait a moment and try again.";
  }
  return data.error ?? `Request failed (${response.status})`;
}

export async function fetchProgress(): Promise<LearnerState | null> {
  const response = await fetch("/api/progress", { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as LearnerState;
}

export async function patchProgress(patch: {
  lastVisitedModuleId?: string;
  challengePassedModuleIds?: string[];
}): Promise<LearnerState> {
  const response = await fetch("/api/progress", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as LearnerState;
}

export async function saveProgress(state: LearnerState): Promise<void> {
  const response = await fetch("/api/progress", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error(await readApiError(response));
}

export async function submitQuiz(
  moduleId: string,
  answers: number[],
): Promise<{
  score: number;
  passed: boolean;
  state: LearnerState;
}> {
  const response = await fetch("/api/submit-quiz", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ moduleId, answers }),
  });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as { score: number; passed: boolean; state: LearnerState };
}

export async function submitChallengePass(moduleId: string): Promise<LearnerState> {
  const response = await fetch("/api/submit-challenge", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ moduleId }),
  });
  if (!response.ok) throw new Error(await readApiError(response));
  const data = (await response.json()) as { state: LearnerState };
  return data.state;
}

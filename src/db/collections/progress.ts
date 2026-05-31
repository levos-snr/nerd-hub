import type { LearnerState } from "../../features/gamification/engine";

export async function fetchProgress(): Promise<LearnerState | null> {
  const response = await fetch("/api/progress", { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to load progress");
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
  if (!response.ok) throw new Error("Failed to patch progress");
  return (await response.json()) as LearnerState;
}

export async function saveProgress(state: LearnerState): Promise<void> {
  const response = await fetch("/api/progress", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error("Failed to save progress");
}

export async function submitQuiz(moduleId: string, answers: number[]): Promise<{
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
  if (!response.ok) throw new Error("Failed to submit quiz");
  return (await response.json()) as { score: number; passed: boolean; state: LearnerState };
}

export async function submitChallengePass(moduleId: string): Promise<LearnerState> {
  const response = await fetch("/api/submit-challenge", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ moduleId }),
  });
  if (!response.ok) throw new Error("Failed to save challenge progress");
  const data = (await response.json()) as { state: LearnerState };
  return data.state;
}

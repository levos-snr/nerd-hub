import type { Module } from "../curriculum/types";

export type ProgressRecord = {
  moduleId: string;
  bestScore: number;
  passed: boolean;
  attempts: number;
};

export type LearnerState = {
  xp: number;
  streak: number;
  level: number;
  completedModuleIds: string[];
  progress: Record<string, ProgressRecord>;
};

export function createInitialState(): LearnerState {
  return { xp: 0, streak: 0, level: 1, completedModuleIds: [], progress: {} };
}

export function canUnlockModule(module: Module, completedModuleIds: string[]): boolean {
  return module.prerequisites.every((id) => completedModuleIds.includes(id));
}

export function registerAttempt(
  state: LearnerState,
  module: Module,
  score: number
): LearnerState {
  const passed = score >= module.passScore;
  const existing = state.progress[module.id];
  const attempts = (existing?.attempts ?? 0) + 1;
  const bestScore = Math.max(existing?.bestScore ?? 0, score);
  const progress = { ...state.progress, [module.id]: { moduleId: module.id, bestScore, passed, attempts } };
  const completedModuleIds = passed && !state.completedModuleIds.includes(module.id)
    ? [...state.completedModuleIds, module.id]
    : state.completedModuleIds;
  const xp = state.xp + (passed ? 100 : 25);
  const streak = passed ? state.streak + 1 : 0;
  const level = Math.floor(xp / 500) + 1;
  return { xp, streak, level, completedModuleIds, progress };
}

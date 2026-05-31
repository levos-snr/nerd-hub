import type { Module } from "../curriculum/types";
import { recordDailyActivity, utcToday } from "./dailyStreak";

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
  lastVisitedModuleId?: string;
  challengePassedModuleIds?: string[];
  lastActivityDate?: string;
};

export function createInitialState(): LearnerState {
  return {
    xp: 0,
    streak: 0,
    level: 1,
    completedModuleIds: [],
    progress: {},
    challengePassedModuleIds: [],
  };
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
  const level = Math.floor(xp / 500) + 1;
  const daily = recordDailyActivity(state.streak, state.lastActivityDate, utcToday());
  return {
    xp,
    streak: daily.streak,
    level,
    completedModuleIds,
    progress,
    lastActivityDate: daily.lastActivityDate,
    lastVisitedModuleId: state.lastVisitedModuleId,
    challengePassedModuleIds: state.challengePassedModuleIds,
  };
}

export function markChallengePassed(state: LearnerState, moduleId: string): LearnerState {
  const ids = state.challengePassedModuleIds ?? [];
  if (ids.includes(moduleId)) return state;
  const daily = recordDailyActivity(state.streak, state.lastActivityDate, utcToday());
  return {
    ...state,
    challengePassedModuleIds: [...ids, moduleId],
    streak: daily.streak,
    lastActivityDate: daily.lastActivityDate,
  };
}

export function isChallengePassed(state: LearnerState, moduleId: string): boolean {
  return (state.challengePassedModuleIds ?? []).includes(moduleId);
}

export function touchLastVisited(state: LearnerState, moduleId: string): LearnerState {
  return { ...state, lastVisitedModuleId: moduleId };
}

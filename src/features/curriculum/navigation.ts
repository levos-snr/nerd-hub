import { canUnlockModule } from "../gamification/engine";
import type { LearnerState } from "../gamification/engine";
import type { Module } from "./types";

export function hasLearningActivity(state: LearnerState | null | undefined): boolean {
  if (!state) return false;
  if (state.lastVisitedModuleId) return true;
  if (state.completedModuleIds.length > 0) return true;
  if ((state.challengePassedModuleIds ?? []).length > 0) return true;
  if (Object.keys(state.progress ?? {}).length > 0) return true;
  return state.xp > 0;
}

export function getResumeModuleId(
  modules: Module[],
  completedModuleIds: string[],
  lastVisitedModuleId?: string,
  state?: LearnerState | null
): string | null {
  if (!hasLearningActivity(state ?? null)) {
    return null;
  }

  if (lastVisitedModuleId) {
    const last = modules.find((m) => m.id === lastVisitedModuleId);
    if (
      last &&
      canUnlockModule(last, completedModuleIds) &&
      !completedModuleIds.includes(last.id)
    ) {
      return last.id;
    }
  }

  for (const mod of modules) {
    if (canUnlockModule(mod, completedModuleIds) && !completedModuleIds.includes(mod.id)) {
      return mod.id;
    }
  }

  return null;
}

export function getStartModuleId(modules: Module[], completedModuleIds: string[]): string | null {
  for (const mod of modules) {
    if (canUnlockModule(mod, completedModuleIds) && !completedModuleIds.includes(mod.id)) {
      return mod.id;
    }
  }
  return modules[0]?.id ?? null;
}

export function getNextModuleId(currentId: string, modules: Module[]): string | null {
  const index = modules.findIndex((m) => m.id === currentId);
  if (index === -1 || index >= modules.length - 1) return null;
  return modules[index + 1]?.id ?? null;
}

export function getModuleById(modules: Module[], id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

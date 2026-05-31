import type { LearnerState, ProgressRecord } from "../../features/gamification/engine";
import type { learnerProgress } from "../db/schema";

export function rowToLearnerState(row: typeof learnerProgress.$inferSelect): LearnerState {
  const progressJson = row.progress as Record<string, unknown>;
  const { records, lastVisitedModuleId, challengePassedModuleIds } = parseProgressJson(progressJson);

  return {
    xp: row.xp,
    streak: row.streak,
    level: row.level,
    completedModuleIds: row.completedModuleIds,
    progress: records,
    lastVisitedModuleId,
    challengePassedModuleIds,
    lastActivityDate: row.lastActivityDate ?? undefined,
  };
}

export function learnerStateToRowFields(state: LearnerState) {
  return {
    xp: state.xp,
    streak: state.streak,
    level: state.level,
    completedModuleIds: state.completedModuleIds,
    progress: stateToProgressJson(state),
    lastActivityDate: state.lastActivityDate ?? null,
  };
}

function parseProgressJson(progressJson: Record<string, unknown>): {
  records: Record<string, ProgressRecord>;
  lastVisitedModuleId?: string;
  challengePassedModuleIds: string[];
} {
  if (progressJson.records && typeof progressJson.records === "object") {
    return {
      records: progressJson.records as Record<string, ProgressRecord>,
      lastVisitedModuleId: progressJson.lastVisitedModuleId as string | undefined,
      challengePassedModuleIds: (progressJson.challengePassedModuleIds as string[]) ?? [],
    };
  }

  const firstKey = Object.keys(progressJson)[0];
  const looksLegacy =
    firstKey &&
    typeof progressJson[firstKey] === "object" &&
    progressJson[firstKey] !== null &&
    "moduleId" in (progressJson[firstKey] as object);

  if (looksLegacy) {
    return {
      records: progressJson as Record<string, ProgressRecord>,
      challengePassedModuleIds: [],
    };
  }

  return { records: {}, challengePassedModuleIds: [] };
}

export function stateToProgressJson(state: LearnerState): Record<string, unknown> {
  return {
    records: state.progress,
    lastVisitedModuleId: state.lastVisitedModuleId,
    challengePassedModuleIds: state.challengePassedModuleIds ?? [],
  };
}

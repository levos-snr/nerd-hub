import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/features/gamification/engine";
import {
  getNextModuleId,
  getResumeModuleId,
  getStartModuleId,
  hasLearningActivity,
} from "../../src/features/curriculum/navigation";
import { curriculumModules } from "../../src/features/curriculum/modules";

describe("curriculum navigation", () => {
  it("does not resume for brand-new learners", () => {
    const id = getResumeModuleId(curriculumModules, [], undefined, createInitialState());
    expect(id).toBeNull();
  });

  it("start module is first unlocked", () => {
    const id = getStartModuleId(curriculumModules, []);
    expect(id).toBe(curriculumModules[0].id);
  });

  it("detects learning activity", () => {
    expect(hasLearningActivity(createInitialState())).toBe(false);
    expect(
      hasLearningActivity({ ...createInitialState(), lastVisitedModuleId: "module-1" })
    ).toBe(true);
  });

  it("returns next module in order", () => {
    const first = curriculumModules[0].id;
    const next = getNextModuleId(first, curriculumModules);
    expect(next).toBe(curriculumModules[1].id);
  });

  it("resumes last visited when user has activity", () => {
    const last = curriculumModules[2].id;
    const completed = [curriculumModules[0].id, curriculumModules[1].id];
    const state = { ...createInitialState(), lastVisitedModuleId: last };
    const id = getResumeModuleId(curriculumModules, completed, last, state);
    expect(id).toBe(last);
  });
});

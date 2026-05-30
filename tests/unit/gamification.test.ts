import { describe, expect, it } from "vitest";
import { createInitialState, registerAttempt, canUnlockModule } from "../../src/features/gamification/engine";
import { curriculumModules } from "../../src/features/curriculum/modules";

describe("gamification engine", () => {
  it("unlocks module if prerequisites are completed", () => {
    const second = curriculumModules[1];
    expect(canUnlockModule(second, [])).toBe(false);
    expect(canUnlockModule(second, [curriculumModules[0].id])).toBe(true);
  });

  it("awards xp and completion on passing attempt", () => {
    const module = curriculumModules[0];
    const state = createInitialState();
    const next = registerAttempt(state, module, 95);
    expect(next.xp).toBe(100);
    expect(next.completedModuleIds).toContain(module.id);
    expect(next.progress[module.id].passed).toBe(true);
  });
});

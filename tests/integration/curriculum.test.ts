import { describe, expect, it } from "vitest";
import { curriculumModules, moduleCountByTrack } from "../../src/features/curriculum/modules";

describe("curriculum registry", () => {
  it("contains both JS and TS tracks", () => {
    const tracks = new Set(curriculumModules.map((m) => m.track));
    expect(tracks.has("javascript")).toBe(true);
    expect(tracks.has("typescript")).toBe(true);
  });

  it("includes full JS + TS + pro workshop catalog", () => {
    expect(moduleCountByTrack.javascript).toBeGreaterThanOrEqual(45);
    expect(moduleCountByTrack.typescript).toBeGreaterThanOrEqual(60);
    expect(curriculumModules.length).toBeGreaterThanOrEqual(100);
  });

  it("each module has lesson, quiz, and challenge", () => {
    for (const module of curriculumModules) {
      expect(module.lesson.objectives.length).toBeGreaterThan(0);
      expect(module.quiz.length).toBeGreaterThanOrEqual(3);
      expect(module.challenge.starterCode.length).toBeGreaterThan(0);
    }
  });
});

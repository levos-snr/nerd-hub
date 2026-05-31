import { describe, expect, it } from "vitest";
import { curriculumModules, moduleCountByTrack } from "../../src/features/curriculum/modules";

describe("curriculum registry", () => {
  it("contains both JS and TS tracks", () => {
    const tracks = new Set(curriculumModules.map((m) => m.track));
    expect(tracks.has("javascript")).toBe(true);
    expect(tracks.has("typescript")).toBe(true);
  });

  it("includes W3Schools-aligned JS + TS catalog", () => {
    expect(moduleCountByTrack.javascript).toBeGreaterThanOrEqual(35);
    expect(moduleCountByTrack.typescript).toBeGreaterThanOrEqual(40);
    expect(curriculumModules.length).toBeGreaterThanOrEqual(80);
  });

  it("each module has lesson, quiz, and challenge with tests", () => {
    for (const module of curriculumModules) {
      expect(module.lesson.objectives.length).toBeGreaterThan(0);
      expect(module.quiz.length).toBeGreaterThanOrEqual(3);
      expect(module.challenge.starterCode.length).toBeGreaterThan(0);
      expect(module.challenge.tests.length).toBeGreaterThan(0);
      expect(module.challenge.language).toMatch(/javascript|typescript/);
    }
  });

  it("flagship modules have unique summaries", () => {
    const arrays = curriculumModules.find((m) => m.title === "JS Arrays");
    expect(arrays?.lesson.content).toContain("Arrays store ordered");
  });
});

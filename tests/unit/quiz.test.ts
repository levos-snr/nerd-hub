import { describe, expect, it } from "vitest";
import { scoreQuiz } from "../../src/features/assessment/quiz";

describe("quiz scoring", () => {
  it("returns 100 for all correct answers", () => {
    const score = scoreQuiz([{ answerIndex: 1 }, { answerIndex: 0 }], [1, 0]);
    expect(score).toBe(100);
  });

  it("returns partial score for mixed answers", () => {
    const score = scoreQuiz([{ answerIndex: 1 }, { answerIndex: 0 }], [0, 0]);
    expect(score).toBe(50);
  });
});

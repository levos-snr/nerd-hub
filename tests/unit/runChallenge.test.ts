import { describe, expect, it } from "vitest";
import { runChallenge } from "../../src/features/assessment/runChallenge";

describe("runChallenge", () => {
  it("passes when solve returns expected values", () => {
    const code = `export function solve(input) { return input; }\n`;
    const result = runChallenge(
      code,
      [
        { label: "a", input: 1, expected: 1 },
        { label: "b", input: "x", expected: "x" },
      ],
      "javascript"
    );
    expect(result.passed).toBe(true);
  });

  it("fails on mismatch", () => {
    const code = `export function solve() { return 0; }\n`;
    const result = runChallenge(
      code,
      [{ label: "one", input: null, expected: 1 }],
      "javascript"
    );
    expect(result.passed).toBe(false);
  });
});

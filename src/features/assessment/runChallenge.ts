import type { ChallengeTest } from "../curriculum/types";

export type ChallengeRunResult = {
  passed: boolean;
  results: Array<{ label: string; passed: boolean; message: string }>;
};

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const keys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
    for (const key of keys) {
      if (!deepEqual(aObj[key], bObj[key])) return false;
    }
    return true;
  }
  return false;
}

function stripExport(code: string): string {
  return code.replace(/^\s*export\s+/gm, "");
}

function compileSolve(code: string, language: "javascript" | "typescript"): (input: unknown) => unknown {
  const body = stripExport(code);
  const wrapped =
    language === "typescript"
      ? `${body}\n;return (solve as (input: unknown) => unknown)(input);`
      : `${body}\n;return solve(input);`;

  const fn = new Function("input", wrapped) as (input: unknown) => unknown;
  return fn;
}

export function runChallenge(
  userCode: string,
  tests: ChallengeTest[] | undefined,
  language: "javascript" | "typescript"
): ChallengeRunResult {
  const safeTests = tests ?? [];
  if (safeTests.length === 0) {
    return {
      passed: false,
      results: [
        {
          label: "Setup",
          passed: false,
          message: "No tests defined for this module. Run pnpm db:sync-modules to refresh curriculum.",
        },
      ],
    };
  }

  const results: ChallengeRunResult["results"] = [];

  let solve: (input: unknown) => unknown;
  try {
    solve = compileSolve(userCode, language);
  } catch (error) {
    return {
      passed: false,
      results: [
        {
          label: "Compile",
          passed: false,
          message: error instanceof Error ? error.message : "Could not parse your code",
        },
      ],
    };
  }

  for (const test of safeTests) {
    try {
      const actual = solve(test.input);
      const passed = deepEqual(actual, test.expected);
      results.push({
        label: test.label,
        passed,
        message: passed
          ? "Passed"
          : `Expected ${JSON.stringify(test.expected)}, got ${JSON.stringify(actual)}`,
      });
    } catch (error) {
      results.push({
        label: test.label,
        passed: false,
        message: error instanceof Error ? error.message : "Runtime error",
      });
    }
  }

  return { passed: results.every((r) => r.passed), results };
}

import type { TopicContent } from "../src/features/curriculum/topicTypes";
import { w3ExerciseRegistry } from "../src/features/curriculum/w3Exercises";

const topicOutlines: Record<
  string,
  { summary: string; exampleJs: string; exampleTs: string; challenge: string }
> = {
  "JS Operators": {
    summary:
      "Operators perform arithmetic, comparison, and logical work on values. Master +, ===, &&, and ?? for predictable code.",
    exampleJs: "const a = 10, b = 3;\nconsole.log(a + b, a === b, a > b);",
    exampleTs: "const a = 10, b = 3;\nconsole.log(a + b, a === b, a > b);",
    challenge: "applyOp",
  },
  "JS Loops": {
    summary:
      "Loops repeat work: for, while, for...of, and for...in each fit different data shapes.",
    exampleJs: "for (const n of [1, 2, 3]) console.log(n * 2);",
    exampleTs: "const nums = [1, 2, 3];\nnums.forEach((n) => console.log(n * 2));",
    challenge: "sumUntil",
  },
};

function outlineFor(title: string) {
  return (
    topicOutlines[title] ?? {
      summary: `${title} covers language features you use in production apps—not just syntax trivia.`,
      exampleJs: `// ${title}\nconst demo = { topic: "${title}", ready: true };\nconsole.log(demo);`,
      exampleTs: `// ${title}\nconst demo: { topic: string; ready: boolean } = { topic: "${title}", ready: true };`,
      challenge: "identity",
    }
  );
}

export function generateTopicContent(
  title: string,
  track: "javascript" | "typescript",
): TopicContent {
  const registry = w3ExerciseRegistry[title];
  if (registry) {
    const o = outlineFor(title);
    const base = buildFromOutline(title, track, o);
    return {
      ...base,
      ...registry,
      example:
        registry.example ??
        (track === "javascript" ? (registry as { example?: string }).example : base.example) ??
        base.example,
      starterCodeJs: registry.starterCodeJs ?? base.starterCodeJs,
      starterCodeTs: registry.starterCodeTs ?? base.starterCodeTs,
      tests: registry.tests ?? base.tests,
    };
  }

  const o = outlineFor(title);
  return buildFromOutline(title, track, o);
}

function buildFromOutline(
  title: string,
  track: "javascript" | "typescript",
  o: ReturnType<typeof outlineFor>,
): TopicContent {
  const summary = o.summary;

  const tests =
    o.challenge === "applyOp"
      ? [
          { label: "add", input: [2, "+", 3], expected: 5 },
          { label: "strict equal", input: [4, "===", 4], expected: true },
        ]
      : o.challenge === "sumUntil"
        ? [
            { label: "sum 3", input: 3, expected: 6 },
            { label: "sum 1", input: 1, expected: 1 },
          ]
        : [
            { label: "returns input", input: "hello", expected: "hello" },
            { label: "returns number", input: 7, expected: 7 },
          ];

  const starterJs =
    o.challenge === "applyOp"
      ? `export function solve(input) {\n  const [a, op, b] = input;\n  return null;\n}\n`
      : o.challenge === "sumUntil"
        ? `export function solve(n) {\n  return 0;\n}\n`
        : `export function solve(input) {\n  return input;\n}\n`;

  const starterTs =
    o.challenge === "applyOp"
      ? `export function solve(input: [number, string, number]): unknown {\n  const [a, op, b] = input;\n  return null;\n}\n`
      : o.challenge === "sumUntil"
        ? `export function solve(n: number): number {\n  return 0;\n}\n`
        : `export function solve(input: unknown): unknown {\n  return input;\n}\n`;

  return {
    summary,
    objectives: [
      `Explain what ${title} is used for`,
      `Write a small example using ${title}`,
      `Avoid a common ${title} pitfall`,
    ],
    example: track === "javascript" ? o.exampleJs : o.exampleTs,
    challengePrompt:
      o.challenge === "applyOp"
        ? "Implement solve(input) where input is [a, op, b] and op is +, -, *, /, ===, or >."
        : o.challenge === "sumUntil"
          ? "Return the sum 1..n inclusive."
          : `Implement solve for ${title} so all tests pass.`,
    starterCodeJs: starterJs,
    starterCodeTs: starterTs,
    tests,
    hint: `Focus on the ${title} concept shown in the lesson example.`,
    quizExtra: {
      prompt: `In ${title}, which approach is most reliable in production?`,
      options: [
        "Guess behavior without reading docs",
        "Write a tiny example and test it",
        "Disable strict checks",
        "Copy unrelated snippets",
      ],
      answerIndex: 1,
    },
    quizQ1: {
      prompt: `What should you verify first when learning ${title}?`,
      options: ["Syntax only", "Real input/output behavior", "CSS selectors", "Package names"],
      answerIndex: 1,
    },
    quizQ3: {
      prompt: `How does ${title} help when moving from JS to TS?`,
      options: [
        "It does not",
        "Shared mental models transfer",
        "Only for CSS",
        "Only on the server",
      ],
      answerIndex: 1,
    },
  };
}

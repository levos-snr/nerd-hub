import type { TopicContent } from "./topicTypes";
import { tsProWorkshopTopics, w3JavaScriptTopics, w3TypeScriptTopics } from "./w3syllabus";


export const w3ExerciseRegistry: Record<string, Partial<TopicContent>> = {
  "JS Tutorial": {
    summary: "JavaScript powers interactive web pages. You run it in the browser console or in .js files loaded by HTML.",
    example: `console.log("Hello from JavaScript!");\nconst year = new Date().getFullYear();\nconsole.log(year);`,
    challengePrompt: "Return the string 'Hello from JavaScript!'",
    starterCodeJs: `export function solve() {\n  return "";\n}\n`,
    starterCodeTs: `export function solve(): string {\n  return "";\n}\n`,
    tests: [{ label: "greeting", input: null, expected: "Hello from JavaScript!" }],
  },
  "JS Syntax": {
    summary: "JavaScript statements end with semicolons. Use const for values that won't be reassigned, let when they will.",
    example: `const PI = 3.14;\nlet count = 0;\ncount += 1;`,
    challengePrompt: "Given [a, b], return their sum.",
    tests: [
      { label: "sum", input: [3, 7], expected: 10 },
      { label: "zero", input: [0, 0], expected: 0 },
    ],
    starterCodeJs: `export function solve(pair) {\n  const [a, b] = pair;\n  return 0;\n}\n`,
  },
  "JS Operators": {
    summary: "Arithmetic (+, -, *, /), comparison (===, !==), and logical (&&, ||) operators combine values and conditions.",
    example: `const ok = 5 > 3 && 2 === 2;\nconst total = 10 + 5 * 2; // 20`,
    challengePrompt: "Input: [a, op, b]. op is '+', '-', '*', or '/'. Return the result.",
    tests: [
      { label: "add", input: [4, "+", 5], expected: 9 },
      { label: "mul", input: [3, "*", 4], expected: 12 },
    ],
    starterCodeJs: `export function solve([a, op, b]) {\n  return null;\n}\n`,
  },
  "JS If Conditions": {
    summary: "if/else runs code when conditions are true. Use === for equality; remember 0, '', null, undefined are falsy.",
    example: `function grade(score) {\n  if (score >= 70) return "pass";\n  return "fail";\n}`,
    challengePrompt: "Return 'pass' if score >= 70, else 'fail'.",
    tests: [
      { label: "pass", input: 85, expected: "pass" },
      { label: "fail", input: 50, expected: "fail" },
    ],
    starterCodeJs: `export function solve(score) {\n  return "";\n}\n`,
  },
  "JS Loops": {
    summary: "for, while, and for...of repeat code. for...of is ideal for iterating array values.",
    example: `let sum = 0;\nfor (const n of [1, 2, 3, 4]) {\n  sum += n;\n}`,
    challengePrompt: "Return the sum of integers from 1 to n inclusive.",
    tests: [
      { label: "n=5", input: 5, expected: 15 },
      { label: "n=1", input: 1, expected: 1 },
    ],
    starterCodeJs: `export function solve(n) {\n  return 0;\n}\n`,
  },
  "JS Functions": {
    summary: "Functions package reusable logic. Parameters are local; return sends a value back to the caller.",
    example: `function double(n) {\n  return n * 2;\n}\nconst triple = (n) => n * 3;`,
    challengePrompt: "Return name greeting: `Hello, {name}!`",
    tests: [{ label: "greet", input: "Ada", expected: "Hello, Ada!" }],
    starterCodeJs: `export function solve(name) {\n  return "";\n}\n`,
  },
  "JS Arrays": {
    summary: "Arrays are ordered lists. map, filter, and reduce are the workhorses of array transformation.",
    example: `const nums = [1, 2, 3];\nconst doubled = nums.map((n) => n * 2);`,
    challengePrompt: "Return the sum of all numbers in the array.",
    tests: [
      { label: "sum", input: [1, 2, 3], expected: 6 },
      { label: "empty", input: [], expected: 0 },
    ],
    starterCodeJs: `export function solve(values) {\n  return 0;\n}\n`,
  },
  "TS Introduction": {
    summary: "TypeScript is a typed superset of JavaScript. Types catch mistakes before runtime and improve editor tooling.",
    example: `let username: string = "learner";\nlet level: number = 1;`,
    challengePrompt: "Return the input string (typed exercise).",
    tests: [{ label: "echo", input: "TS", expected: "TS" }],
    starterCodeTs: `export function solve(value: string): string {\n  return "";\n}\n`,
  },
  "TS Simple Types": {
    summary: "Annotate primitives: string, number, boolean, bigint, symbol. TypeScript validates assignments at compile time.",
    example: `const active: boolean = true;\nconst price: number = 9.99;`,
    challengePrompt: "Return true if n is positive.",
    tests: [
      { label: "pos", input: 5, expected: true },
      { label: "neg", input: -1, expected: false },
    ],
    starterCodeTs: `export function solve(n: number): boolean {\n  return false;\n}\n`,
  },
  "TS Union Types": {
    summary: "A union type is A | B — the value can be either. Narrow with typeof or discriminant properties before use.",
    example: `type Result = { ok: true; data: string } | { ok: false; error: string };`,
    challengePrompt: "If input is string return its length; if number return String(n).length.",
    tests: [
      { label: "str", input: "abc", expected: 3 },
      { label: "num", input: 42, expected: 2 },
    ],
    starterCodeTs: `export function solve(value: string | number): number {\n  return 0;\n}\n`,
  },
};

function fillExercise(title: string, track: "javascript" | "typescript"): Partial<TopicContent> {
  const slug = title.replace(/^JS |^TS /, "").toLowerCase();
  return {
    summary: `Learn ${title}: practical concepts aligned with the W3Schools ${track === "javascript" ? "JavaScript" : "TypeScript"} tutorial track.`,
    example:
      track === "javascript"
        ? `// ${title}\nconst result = { topic: "${slug}", ok: true };\nconsole.log(result);`
        : `// ${title}\nconst result: { topic: string; ok: boolean } = { topic: "${slug}", ok: true };`,
    challengePrompt: `Implement solve(input) for the ${title} exercise.`,
    tests: [
      { label: "echo", input: slug, expected: slug },
      { label: "passthrough", input: 1, expected: 1 },
    ],
    starterCodeJs: `export function solve(input) {\n  // ${title}\n  return input;\n}\n`,
    starterCodeTs: `export function solve(input: unknown): unknown {\n  // ${title}\n  return input;\n}\n`,
  };
}

for (const title of [...w3JavaScriptTopics, ...w3TypeScriptTopics, ...tsProWorkshopTopics]) {
  if (!w3ExerciseRegistry[title]) {
    const track = title.startsWith("JS") ? "javascript" : "typescript";
    w3ExerciseRegistry[title] = fillExercise(title, track);
  }
}

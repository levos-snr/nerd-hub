import type { TopicContent } from "./topicTypes";

export const flagshipContent: Record<string, TopicContent> = {
  "JS Arrays": {
    summary:
      "Arrays store ordered values. Use map/filter/reduce for transformations without mutating originals when possible.",
    objectives: [
      "Create and index arrays",
      "Use map and reduce safely",
      "Choose array vs object storage",
    ],
    example: `const prices = [9, 14, 7];\nconst total = prices.reduce((sum, p) => sum + p, 0);`,
    challengePrompt: "Return the sum of all numbers in the array.",
    starterCodeJs: `export function solve(values) {\n  // TODO\n  return 0;\n}\n`,
    starterCodeTs: `export function solve(values: number[]): number {\n  return 0;\n}\n`,
    tests: [
      { label: "empty", input: [], expected: 0 },
      { label: "mixed", input: [1, 2, 3], expected: 6 },
    ],
    hint: "reduce with an initial accumulator of 0 works well.",
    quizExtra: {
      prompt: "Which method returns a new array without changing the original?",
      options: ["push", "sort", "map", "splice"],
      answerIndex: 2,
    },
    quizQ1: {
      prompt: "What is the index of the first element?",
      options: ["1", "0", "-1", "undefined"],
      answerIndex: 1,
    },
    quizQ3: {
      prompt: "Why use reduce over a manual for-loop?",
      options: [
        "It is always faster",
        "It expresses aggregation clearly",
        "It removes types",
        "It avoids memory",
      ],
      answerIndex: 1,
    },
  },
  "JS Functions": {
    summary:
      "Functions package reusable logic. Arrow functions inherit lexical `this`; declarations are hoisted.",
    objectives: [
      "Declare functions",
      "Pass arguments and return values",
      "Pick arrow vs function syntax",
    ],
    example: `function greet(name) {\n  return \`Hello, \${name}\`;\n}\nconst hi = (n) => greet(n);`,
    challengePrompt: "Return a greeting string: `Hello, {name}!`",
    starterCodeJs: `export function solve(name) {\n  return "";\n}\n`,
    starterCodeTs: `export function solve(name: string): string {\n  return "";\n}\n`,
    tests: [
      { label: "Ada", input: "Ada", expected: "Hello, Ada!" },
      { label: "you", input: "you", expected: "Hello, you!" },
    ],
    quizExtra: {
      prompt: "What does a function return if there is no return statement?",
      options: ["0", "undefined", "null", "false"],
      answerIndex: 1,
    },
  },
  "JS Objects": {
    summary:
      "Objects group related keys and values. Use shorthand properties and optional chaining for safe access.",
    objectives: [
      "Create object literals",
      "Read and update properties",
      "Avoid accidental mutation",
    ],
    example: `const user = { id: 1, name: "Sam" };\nconsole.log(user.name);`,
    challengePrompt: "Given { first, last }, return the full name with a space.",
    starterCodeJs: `export function solve(person) {\n  return "";\n}\n`,
    starterCodeTs: `export function solve(person: { first: string; last: string }): string {\n  return "";\n}\n`,
    tests: [{ label: "name", input: { first: "Ada", last: "Lovelace" }, expected: "Ada Lovelace" }],
    quizExtra: {
      prompt: "How do you read property `name` safely when obj may be null?",
      options: ["obj.name()", "obj?.name", "name.obj", "obj[name]++"],
      answerIndex: 1,
    },
  },
  "JS Asynchronous": {
    summary: "Promises and async/await model delayed work without blocking the main thread.",
    objectives: ["Create async functions", "Await promises", "Handle errors with try/catch"],
    example: `async function load() {\n  const res = await fetch("/api/modules");\n  return res.json();\n}`,
    challengePrompt: "Return input delayed by wrapping in Promise.resolve (simulate async).",
    starterCodeJs: `export function solve(value) {\n  return Promise.resolve(value);\n}\n`,
    starterCodeTs: `export function solve(value: unknown): Promise<unknown> {\n  return Promise.resolve(value);\n}\n`,
    tests: [{ label: "resolved", input: 42, expected: 42 }],
    quizExtra: {
      prompt: "What does await do inside an async function?",
      options: [
        "Blocks the CPU forever",
        "Pauses the function until a promise settles",
        "Deletes the promise",
        "Runs sync code later",
      ],
      answerIndex: 1,
    },
  },
  "JS Errors": {
    summary: "Throw and catch errors to handle failure paths explicitly instead of silent bugs.",
    objectives: [
      "Use try/catch/finally",
      "Throw meaningful errors",
      "Distinguish expected vs programmer errors",
    ],
    example: `try {\n  JSON.parse("{bad}");\n} catch (e) {\n  console.error("Invalid JSON", e);\n}`,
    challengePrompt: "If input is negative, throw Error('negative'); otherwise return input.",
    starterCodeJs: `export function solve(n) {\n  return n;\n}\n`,
    starterCodeTs: `export function solve(n: number): number {\n  return n;\n}\n`,
    tests: [{ label: "ok", input: 2, expected: 2 }],
    hint: "Use if (n < 0) throw new Error('negative')",
    quizExtra: {
      prompt: "When should you throw an error?",
      options: [
        "For normal control flow",
        "When continuing is impossible",
        "Every function",
        "Never",
      ],
      answerIndex: 1,
    },
  },
  "TS Simple Types": {
    summary: "Annotate primitives and objects so TypeScript catches mismatches before runtime.",
    objectives: ["Annotate string/number/boolean", "Infer simple types", "Read type errors"],
    example: `let count: number = 0;\nconst title: string = "Lesson";`,
    challengePrompt: "Return input typed as string (implementation returns the string).",
    starterCodeJs: `export function solve(input) { return input; }\n`,
    starterCodeTs: `export function solve(input: string): string {\n  return input;\n}\n`,
    tests: [{ label: "hello", input: "hello", expected: "hello" }],
    quizExtra: {
      prompt: "What does `: number` on a variable mean?",
      options: [
        "Runtime cast",
        "Compile-time type annotation",
        "HTML attribute",
        "Database column",
      ],
      answerIndex: 1,
    },
  },
  "TS Functions": {
    summary: "Function types describe parameters and return values for safer APIs.",
    objectives: [
      "Type parameters and returns",
      "Use optional parameters",
      "Prefer explicit return types on public APIs",
    ],
    example: `function add(a: number, b: number): number {\n  return a + b;\n}`,
    challengePrompt: "Return a + b for two numbers.",
    starterCodeJs: `export function solve(pair) { return 0; }\n`,
    starterCodeTs: `export function solve(pair: [number, number]): number {\n  return 0;\n}\n`,
    tests: [{ label: "add", input: [2, 3], expected: 5 }],
    quizExtra: {
      prompt: "Where are function types checked?",
      options: ["Only in browser", "At compile time", "Only in CSS", "Never"],
      answerIndex: 1,
    },
  },
  "TS Union Types": {
    summary: "Unions express values that may be one of several shapes—narrow before use.",
    objectives: ["Declare unions", "Narrow with typeof/in", "Model success/failure results"],
    example: `type Id = string | number;\nfunction printId(id: Id) {\n  if (typeof id === "string") console.log(id.toUpperCase());\n}`,
    challengePrompt:
      "Given string | number, return its length (string length or number digit count as string).",
    starterCodeJs: `export function solve(v) { return 0; }\n`,
    starterCodeTs: `export function solve(v: string | number): number {\n  return 0;\n}\n`,
    tests: [
      { label: "str", input: "abc", expected: 3 },
      { label: "num", input: 1000, expected: 4 },
    ],
    hint: "typeof v === 'string' ? v.length : String(v).length",
    quizExtra: {
      prompt: "Why narrow a union before using it?",
      options: [
        "For speed only",
        "So TypeScript knows the exact shape",
        "To remove JS",
        "For styling",
      ],
      answerIndex: 1,
    },
  },
  "TS Basic Generics": {
    summary:
      "Generics write reusable functions and types while preserving input/output relationships.",
    objectives: ["Write generic functions", "Use type parameters on interfaces", "Avoid any"],
    example: `function first<T>(items: T[]): T | undefined {\n  return items[0];\n}`,
    challengePrompt: "Return the first element of an array or undefined if empty.",
    starterCodeJs: `export function solve(items) { return undefined; }\n`,
    starterCodeTs: `export function solve<T>(items: T[]): T | undefined {\n  return undefined;\n}\n`,
    tests: [
      { label: "empty", input: [], expected: undefined },
      { label: "one", input: [9], expected: 9 },
    ],
    quizExtra: {
      prompt: "What does <T> on a function mean?",
      options: ["HTML tag", "Type parameter", "Test runner", "Template string"],
      answerIndex: 1,
    },
  },
  "TS Type Guards": {
    summary: "Type guards refine unions to a specific type inside a block.",
    objectives: [
      "Use typeof and custom guards",
      "Model discriminated unions",
      "Return early on invalid shapes",
    ],
    example: `function isUser(x: unknown): x is { name: string } {\n  return typeof x === "object" && x !== null && "name" in x;\n}`,
    challengePrompt: "Return true if value is a non-null object with key 'id'.",
    starterCodeJs: `export function solve(value) { return false; }\n`,
    starterCodeTs: `export function solve(value: unknown): boolean {\n  return false;\n}\n`,
    tests: [
      { label: "valid", input: { id: 1 }, expected: true },
      { label: "invalid", input: null, expected: false },
    ],
    quizExtra: {
      prompt: "A user-defined type guard uses which return type?",
      options: ["boolean", "x is SomeType", "void", "any"],
      answerIndex: 1,
    },
  },
};

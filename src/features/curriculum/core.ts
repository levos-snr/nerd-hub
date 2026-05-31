import type { TopicContent } from "./topicTypes";

/** First 25 syllabus topics not covered by flagship modules */
export const coreTitles = [
  "JS Tutorial",
  "TS Introduction",
  "JS Syntax",
  "JS Operators",
  "TS Explicit & Inference",
  "JS If Conditions",
  "TS Special Types",
  "JS Loops",
  "TS Arrays",
  "JS Strings",
  "TS Tuples",
  "JS Numbers",
  "TS Object Types",
  "TS Classes",
  "JS Scope",
  "TS Enums",
  "TS Aliases & Interfaces",
  "JS Sets",
  "TS Casting",
  "JS Maps",
  "JS Iterations",
  "TS Utility Types",
  "JS Math",
  "TS Keyof",
  "JS RegExp",
] as const;

function core(
  summary: string,
  exampleJs: string,
  exampleTs: string,
  challengePrompt: string,
  tests: TopicContent["tests"],
  starterJs: string,
  starterTs: string,
  quizExtra: TopicContent["quizExtra"]
): TopicContent {
  return {
    summary,
    objectives: ["Read and explain the example", "Complete the coding challenge", "Answer concept checks"],
    example: exampleJs,
    challengePrompt,
    starterCodeJs: starterJs,
    starterCodeTs: starterTs,
    tests,
    quizExtra,
    quizQ1: {
      prompt: "What is the best way to learn this topic?",
      options: ["Memorize only", "Type a small example", "Skip exercises", "Avoid docs"],
      answerIndex: 1,
    },
    quizQ3: {
      prompt: "How does this topic connect JS and TS?",
      options: ["It does not", "Shared concepts in both", "CSS only", "Server only"],
      answerIndex: 1,
    },
  };
}

export const coreContent: Record<string, TopicContent> = {
  "JS Tutorial": core(
    "JavaScript runs in browsers and Node. Scripts respond to events and manipulate data.",
    `console.log("Hello, learner");`,
    `console.log("Hello, learner");`,
    "Return the string 'Hello, learner'.",
    [{ label: "greet", input: null, expected: "Hello, learner" }],
    `export function solve() {\n  return "";\n}\n`,
    `export function solve(): string {\n  return "";\n}\n`,
    { prompt: "Where does client-side JS run?", options: ["Only databases", "Browsers and Node", "Only CSS", "Only Git"], answerIndex: 1 }
  ),
  "TS Introduction": core(
    "TypeScript adds optional static types to JavaScript and compiles to plain JS.",
    `const msg: string = "typed";\nconsole.log(msg);`,
    `const msg: string = "typed";\nconsole.log(msg);`,
    "Return the input string unchanged.",
    [{ label: "echo", input: "typed", expected: "typed" }],
    `export function solve(s) { return ""; }\n`,
    `export function solve(s: string): string { return ""; }\n`,
    { prompt: "What does TypeScript compile to?", options: ["Binary", "JavaScript", "CSS", "SQL"], answerIndex: 1 }
  ),
  "JS Syntax": core(
    "Statements end with semicolons (optional but recommended). Blocks use { } and declarations use const/let.",
    `const x = 1;\nlet y = 2;`,
    `const x = 1;\nlet y = 2;`,
    "Return the sum of two numbers a and b passed as [a,b].",
    [{ label: "sum", input: [2, 3], expected: 5 }],
    `export function solve(pair) { return 0; }\n`,
    `export function solve(pair: [number, number]): number { return 0; }\n`,
    { prompt: "Which keyword prevents reassignment?", options: ["var", "let", "const", "function"], answerIndex: 2 }
  ),
  "JS Operators": core(
    "Operators combine values: arithmetic (+), comparison (===), logical (&&).",
    `console.log(5 + 3, 5 === "5");`,
    `console.log(5 + 3, 5 === "5");`,
    "Given [a, op, b] with op one of + - * /, return the result.",
    [
      { label: "add", input: [2, "+", 3], expected: 5 },
      { label: "sub", input: [10, "-", 4], expected: 6 },
    ],
    `export function solve([a, op, b]) {\n  return 0;\n}\n`,
    `export function solve([a, op, b]: [number, string, number]): number {\n  return 0;\n}\n`,
    { prompt: "Which operator checks value and type?", options: ["==", "===", "!=", "&&"], answerIndex: 1 }
  ),
  "TS Explicit & Inference": core(
    "TypeScript can infer types from initializers; explicit annotations document public APIs.",
    `const n = 42; // inferred number`,
    `const n = 42; // inferred number`,
    "Return typeof input as a string ('string'|'number'|'boolean').",
    [
      { label: "num", input: 1, expected: "number" },
      { label: "str", input: "x", expected: "string" },
    ],
    `export function solve(v) { return ""; }\n`,
    `export function solve(v: unknown): string { return ""; }\n`,
    { prompt: "When is explicit annotation most useful?", options: ["Never", "Public function signatures", "Comments only", "CSS"], answerIndex: 1 }
  ),
  "JS If Conditions": core(
    "if/else chooses branches. Falsy values include 0, '', null, undefined, and NaN.",
    `const score = 82;\nif (score >= 70) console.log("pass");`,
    `const score = 82;\nif (score >= 70) console.log("pass");`,
    "Return true if score >= passScore.",
    [
      { label: "pass", input: { score: 80, passScore: 70 }, expected: true },
      { label: "fail", input: { score: 60, passScore: 70 }, expected: false },
    ],
    `export function solve({ score, passScore }) { return false; }\n`,
    `export function solve({ score, passScore }: { score: number; passScore: number }): boolean {\n  return false;\n}\n`,
    { prompt: "Which value is falsy?", options: ["[]", "'0'", "0", "{}"], answerIndex: 2 }
  ),
  "TS Special Types": core(
    "any disables checking; unknown is safer; never means unreachable.",
    `let data: unknown = fetchData();`,
    `let data: unknown = fetchData();`,
    "Return true when value is undefined.",
    [
      { label: "undef", input: undefined, expected: true },
      { label: "zero", input: 0, expected: false },
    ],
    `export function solve(v) { return false; }\n`,
    `export function solve(v: unknown): boolean { return false; }\n`,
    { prompt: "Which type is safest for unknown input?", options: ["any", "unknown", "never", "object"], answerIndex: 1 }
  ),
  "JS Loops": core(
    "Loops repeat until a condition ends. for...of is ideal for array values.",
    `let sum = 0;\nfor (const n of [1,2,3]) sum += n;`,
    `let sum = 0;\nfor (const n of [1,2,3]) sum += n;`,
    "Return sum of numbers 1..n inclusive.",
    [
      { label: "3", input: 3, expected: 6 },
      { label: "1", input: 1, expected: 1 },
    ],
    `export function solve(n) { return 0; }\n`,
    `export function solve(n: number): number { return 0; }\n`,
    { prompt: "Which loop iterates array values?", options: ["for...in", "for...of", "while false", "do CSS"], answerIndex: 1 }
  ),
  "TS Arrays": core(
    "Array<T> types hold homogeneous lists with compile-time checks.",
    `const ids: number[] = [1, 2, 3];`,
    `const ids: number[] = [1, 2, 3];`,
    "Return the length of a number array.",
    [
      { label: "len", input: [1, 2, 3], expected: 3 },
      { label: "empty", input: [], expected: 0 },
    ],
    `export function solve(arr) { return 0; }\n`,
    `export function solve(arr: number[]): number { return 0; }\n`,
    { prompt: "How do you type an array of strings?", options: ["string", "Array<string>", "Both B and string[]", "map"], answerIndex: 2 }
  ),
  "JS Strings": core(
    "Strings are immutable UTF-16 sequences. Template literals embed expressions.",
    `const name = "Ada";\nconsole.log(\`Hi \${name}\`);`,
    `const name = "Ada";\nconsole.log(\`Hi \${name}\`);`,
    "Return input uppercased.",
    [{ label: "up", input: "hi", expected: "HI" }],
    `export function solve(s) { return ""; }\n`,
    `export function solve(s: string): string { return ""; }\n`,
    { prompt: "Are strings mutable in JS?", options: ["Yes", "No", "Only in TS", "Only arrays"], answerIndex: 1 }
  ),
  "TS Tuples": core(
    "Tuples are fixed-length arrays with specific types per index.",
    `type Point = [number, number];\nconst p: Point = [0, 1];`,
    `type Point = [number, number];\nconst p: Point = [0, 1];`,
    "Given [x,y], return x + y.",
    [{ label: "add", input: [2, 3], expected: 5 }],
    `export function solve(t) { return 0; }\n`,
    `export function solve(t: [number, number]): number { return 0; }\n`,
    { prompt: "Tuples are best for?", options: ["Any length list", "Fixed positions with types", "CSS", "DOM"], answerIndex: 1 }
  ),
  "JS Numbers": core(
    "Numbers are IEEE-754 doubles. Use Number.isNaN and Math helpers.",
    `console.log(Math.round(4.6), Number.isNaN(NaN));`,
    `console.log(Math.round(4.6), Number.isNaN(NaN));`,
    "Return n rounded to nearest integer.",
    [{ label: "round", input: 4.6, expected: 5 }],
    `export function solve(n) { return 0; }\n`,
    `export function solve(n: number): number { return 0; }\n`,
    { prompt: "NaN === NaN is?", options: ["true", "false", "undefined", "1"], answerIndex: 1 }
  ),
  "TS Object Types": core(
    "Object types list required and optional properties for structured data.",
    `type User = { id: number; name: string };\nconst u: User = { id: 1, name: "Sam" };`,
    `type User = { id: number; name: string };\nconst u: User = { id: 1, name: "Sam" };`,
    "Return user.name from { id, name }.",
    [{ label: "name", input: { id: 1, name: "Sam" }, expected: "Sam" }],
    `export function solve(u) { return ""; }\n`,
    `export function solve(u: { id: number; name: string }): string { return ""; }\n`,
    { prompt: "Optional props use which syntax?", options: ["name?", "optional name", "?name", "name!"], answerIndex: 0 }
  ),
  "TS Classes": core(
    "Classes define constructors, fields, and methods with TypeScript visibility modifiers.",
    `class Counter {\n  constructor(public count = 0) {}\n  inc() { this.count++; }\n}`,
    `class Counter {\n  constructor(public count = 0) {}\n  inc() { this.count++; }\n}`,
    "Return new count after incrementing once.",
    [{ label: "inc", input: 0, expected: 1 }],
    `export function solve(n) { return 0; }\n`,
    `export function solve(n: number): number { return 0; }\n`,
    { prompt: "public in constructor params does what?", options: ["Nothing", "Creates a property", "Deletes field", "CSS"], answerIndex: 1 }
  ),
  "JS Scope": core(
    "Scope is the region where a binding is visible. Blocks create scope for let/const.",
    `function outer() {\n  const x = 1;\n  function inner() { return x; }\n  return inner();\n}`,
    `function outer() {\n  const x = 1;\n  function inner() { return x; }\n  return inner();\n}`,
    "Return the number of keys in object.",
    [{ label: "keys", input: { a: 1, b: 2 }, expected: 2 }],
    `export function solve(obj) { return 0; }\n`,
    `export function solve(obj: Record<string, unknown>): number { return 0; }\n`,
    { prompt: "let and const are scoped to?", options: ["Function only", "Nearest block", "Global always", "Module CSS"], answerIndex: 1 }
  ),
  "TS Enums": core(
    "Enums name numeric or string constants. Prefer const objects in modern TS.",
    `enum Status { Idle, Loading, Done }`,
    `enum Status { Idle, Loading, Done }`,
    "Return Status.Done numeric value when input is 'done' (use 2).",
    [{ label: "done", input: "done", expected: 2 }],
    `export function solve(s) { return 0; }\n`,
    `export function solve(s: string): number { return 0; }\n`,
    { prompt: "String enums help with?", options: ["Runtime CSS", "Readable named constants", "Deleting types", "Loops"], answerIndex: 1 }
  ),
  "TS Aliases & Interfaces": core(
    "type aliases and interface describe object shapes; interfaces can be extended.",
    `interface HasId { id: string }\ntype User = HasId & { name: string };`,
    `interface HasId { id: string }\ntype User = HasId & { name: string };`,
    "Return id from object.",
    [{ label: "id", input: { id: "x", name: "y" }, expected: "x" }],
    `export function solve(o) { return ""; }\n`,
    `export function solve(o: { id: string; name: string }): string { return ""; }\n`,
    { prompt: "interface is best for?", options: ["Primitives only", "Object contracts you extend", "CSS", "Loops"], answerIndex: 1 }
  ),
  "JS Sets": core(
    "Set stores unique values. Useful for membership tests and deduplication.",
    `const tags = new Set(["js", "ts", "js"]);\nconsole.log(tags.size);`,
    `const tags = new Set(["js", "ts", "js"]);\nconsole.log(tags.size);`,
    "Return unique values count from array (use Set).",
    [{ label: "uniq", input: [1, 1, 2], expected: 2 }],
    `export function solve(arr) { return 0; }\n`,
    `export function solve(arr: number[]): number { return 0; }\n`,
    { prompt: "Set automatically does what?", options: ["Sorts", "Deduplicates", "Parses JSON", "Renders DOM"], answerIndex: 1 }
  ),
  "TS Casting": core(
    "Use as or angle brackets sparingly when you know more than the compiler.",
    `const el = document.getElementById("app") as HTMLDivElement;`,
    `const el = document.getElementById("app") as HTMLDivElement;`,
    "Return input as number when given a numeric string.",
    [{ label: "cast", input: "42", expected: 42 }],
    `export function solve(s) { return 0; }\n`,
    `export function solve(s: string): number { return 0; }\n`,
    { prompt: "Casting should be used when?", options: ["Always", "You verified the shape", "Never type", "For CSS"], answerIndex: 1 }
  ),
  "JS Maps": core(
    "Map stores key-value pairs with any key type and preserves insertion order.",
    `const m = new Map([["xp", 100]]);\nm.set("level", 2);`,
    `const m = new Map([["xp", 100]]);\nm.set("level", 2);`,
    "Given { entries: [[k,v],...], key }, return Map.get(key).",
    [
      {
        label: "get",
        input: { entries: [["a", 1], ["b", 2]], key: "b" },
        expected: 2,
      },
    ],
    `export function solve({ entries, key }) {\n  const m = new Map(entries);\n  return m.get(key);\n}\n`,
    `export function solve({ entries, key }: { entries: [string, number][]; key: string }): number | undefined {\n  const m = new Map(entries);\n  return m.get(key);\n}\n`,
    { prompt: "Map keys can be?", options: ["Only strings", "Any type", "Only numbers", "Only symbols"], answerIndex: 1 }
  ),
  "JS Iterations": core(
    "Iterators power for...of. Arrays, strings, and Maps are iterable.",
    `for (const ch of "hi") console.log(ch);`,
    `for (const ch of "hi") console.log(ch);`,
    "Return doubled values of number array.",
    [{ label: "dbl", input: [1, 2], expected: [2, 4] }],
    `export function solve(arr) { return []; }\n`,
    `export function solve(arr: number[]): number[] { return []; }\n`,
    { prompt: "for...of works on?", options: ["Plain objects by default", "Iterables like arrays", "CSS files", "SQL only"], answerIndex: 1 }
  ),
  "TS Utility Types": core(
    "Utility types transform shapes: Partial, Pick, Omit, Record, etc.",
    `type Preview = Partial<{ title: string; body: string }>;`,
    `type Preview = Partial<{ title: string; body: string }>;`,
    "Return keys of object as string array.",
    [{ label: "keys", input: { a: 1 }, expected: ["a"] }],
    `export function solve(o) { return []; }\n`,
    `export function solve(o: Record<string, number>): string[] { return []; }\n`,
    { prompt: "Partial<T> makes properties?", options: ["Required", "Optional", "Readonly", "Deleted"], answerIndex: 1 }
  ),
  "JS Math": core(
    "Math provides constants and functions: min, max, floor, random, etc.",
    `console.log(Math.max(3, 9), Math.floor(4.9));`,
    `console.log(Math.max(3, 9), Math.floor(4.9));`,
    "Return max of two numbers.",
    [{ label: "max", input: [3, 9], expected: 9 }],
    `export function solve(pair) { return 0; }\n`,
    `export function solve(pair: [number, number]): number { return 0; }\n`,
    { prompt: "Math.random returns?", options: ["Integer 1-10", "0 <= n < 1", "Always 0.5", "A Promise"], answerIndex: 1 }
  ),
  "TS Keyof": core(
    "keyof T produces a union of property names for safe accessors.",
    `type Keys = keyof { id: string; name: string }; // "id" | "name"`,
    `type Keys = keyof { id: string; name: string };`,
    "Return value at key from record.",
    [{ label: "get", input: { obj: { a: 1 }, key: "a" }, expected: 1 }],
    `export function solve({ obj, key }) { return 0; }\n`,
    `export function solve({ obj, key }: { obj: Record<string, number>; key: string }): number {\n  return 0;\n}\n`,
    { prompt: "keyof helps prevent?", options: ["Typos in property names", "Network errors", "CSS bugs", "Git conflicts"], answerIndex: 0 }
  ),
  "JS RegExp": core(
    "Regular expressions match patterns in strings with test and exec.",
    `const re = /\\d+/;\nconsole.log(re.test("abc123"));`,
    `const re = /\\d+/;\nconsole.log(re.test("abc123"));`,
    "Return true if string contains only digits.",
    [
      { label: "digits", input: "123", expected: true },
      { label: "mix", input: "a1", expected: false },
    ],
    `export function solve(s) { return false; }\n`,
    `export function solve(s: string): boolean { return false; }\n`,
    { prompt: "RegExp.test returns?", options: ["string", "boolean", "array", "Promise"], answerIndex: 1 }
  ),
};

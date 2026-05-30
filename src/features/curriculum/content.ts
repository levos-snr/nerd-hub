type TopicContent = {
  summary: string;
  objectives: string[];
  example: string;
  challengePrompt: string;
  starterCodeJs: string;
  starterCodeTs: string;
  quizExtra: { prompt: string; options: string[]; answerIndex: number };
};

const defaults = (title: string, track: "javascript" | "typescript"): TopicContent => ({
  summary: `${title} teaches practical patterns you can apply immediately in real projects, with clear examples and checkpoints.`,
  objectives: [
    `Understand the purpose of ${title}`,
    `Apply ${title} in a small hands-on exercise`,
    `Identify and avoid common ${title} mistakes`,
  ],
  example:
    track === "javascript"
      ? `// ${title}\nconst value = 42;\nconsole.log(typeof value);`
      : `// ${title}\ntype Value = number;\nconst value: Value = 42;`,
  challengePrompt: `Complete the starter function using concepts from ${title}.`,
  starterCodeJs: `export function solve(input) {\n  // TODO: implement ${title}\n  return input;\n}\n`,
  starterCodeTs: `export function solve(input: unknown): unknown {\n  // TODO: implement ${title}\n  return input;\n}\n`,
  quizExtra: {
    prompt: `Which practice best reinforces ${title}?`,
    options: ["Skip exercises", "Build a tiny implementation", "Avoid docs", "Disable linting"],
    answerIndex: 1,
  },
});

const overrides: Record<string, Partial<TopicContent>> = {
  "JS Arrays": {
    summary: "Arrays store ordered values. Learn creation, mutation-safe patterns, and iteration.",
    example: `const nums = [1, 2, 3];\nconst doubled = nums.map((n) => n * 2);`,
    starterCodeJs: `export function sumArray(values) {\n  return values.reduce((acc, n) => acc + n, 0);\n}\n`,
  },
  "JS Asynchronous": {
    summary: "Async code handles delays and I/O without blocking the main thread.",
    example: `async function load() {\n  const res = await fetch('/api/modules');\n  return res.json();\n}`,
  },
  "TS Generics": {
    summary: "Generics let functions and types work with many shapes while staying type-safe.",
    example: `function identity<T>(value: T): T {\n  return value;\n}`,
  },
  "TS Basic Generics": {
    summary: "Generics let functions and types work with many shapes while staying type-safe.",
    example: `function identity<T>(value: T): T {\n  return value;\n}`,
  },
  "TS Union Types": {
    summary: "Union types express values that can be one of several shapes.",
    example: `type Result = { ok: true; data: string } | { ok: false; error: string };`,
  },
  "TS Conditional Types": {
    summary: "Conditional types transform types based on conditions at the type level.",
    example: `type IsString<T> = T extends string ? true : false;`,
  },
};

const proWorkshopTitles = [
  "TS Pro: Kickstart Setup",
  "TS Pro: Build Process",
  "TS Pro: Essential Types",
  "TS Pro: IDE Superpowers",
  "TS Pro: Unions and Narrowing",
  "TS Pro: Objects Deep Dive",
  "TS Pro: Mutability",
  "TS Pro: Classes",
  "TS Pro: TS-only Features",
  "TS Pro: Deriving Types",
  "TS Pro: Annotations & Assertions",
  "TS Pro: Weird Parts",
  "TS Pro: Modules & Declarations",
  "TS Pro: External Types",
  "TS Pro: Configuring TS",
  "TS Pro: Designing Types",
  "TS Pro: Utility Patterns",
];

export function getTopicContent(title: string, track: "javascript" | "typescript"): TopicContent {
  const base = defaults(title, track);
  const patch = overrides[title] ?? {};
  return { ...base, ...patch };
}

export { proWorkshopTitles };

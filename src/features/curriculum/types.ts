export type Track = "javascript" | "typescript";

export type Lesson = {
  id: string;
  title: string;
  content: string;
  objectives: string[];
  example: string;
  /** Beginner-friendly clue shown in the lesson panel */
  clue?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export type ChallengeTest = {
  label: string;
  input: unknown;
  expected: unknown;
};

export type Challenge = {
  prompt: string;
  starterCode: string;
  language: "javascript" | "typescript";
  tests: ChallengeTest[];
  hint?: string;
};

export type Module = {
  id: string;
  track: Track;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "pro";
  prerequisites: string[];
  lesson: Lesson;
  quiz: QuizQuestion[];
  challenge: Challenge;
  passScore: number;
};

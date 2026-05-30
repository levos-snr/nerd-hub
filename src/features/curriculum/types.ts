export type Track = "javascript" | "typescript";

export type Lesson = {
  id: string;
  title: string;
  content: string;
  objectives: string[];
  example: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export type Module = {
  id: string;
  track: Track;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "pro";
  prerequisites: string[];
  lesson: Lesson;
  quiz: QuizQuestion[];
  challenge: {
    prompt: string;
    starterCode: string;
    expectedOutcome: string;
  };
  passScore: number;
};

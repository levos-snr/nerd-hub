import type { ChallengeTest } from "./types";

export type TopicQuizExtra = {
  prompt: string;
  options: string[];
  answerIndex: number;
};

export type TopicContent = {
  summary: string;
  objectives: string[];
  example: string;
  challengePrompt: string;
  starterCodeJs: string;
  starterCodeTs: string;
  tests: ChallengeTest[];
  hint?: string;
  quizExtra: TopicQuizExtra;
  quizQ1?: TopicQuizExtra;
  quizQ3?: TopicQuizExtra;
};

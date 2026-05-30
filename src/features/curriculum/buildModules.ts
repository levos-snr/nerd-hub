import { getTopicContent } from "./content";
import { mixedSyllabus } from "./syllabus";
import type { Module } from "./types";

export function buildMixedModules(): Module[] {
  return mixedSyllabus.map((item, index) => {
    const id = `module-${index + 1}`;
    const prerequisites = index === 0 ? [] : [`module-${index}`];
    const difficulty =
      index < 20 ? "beginner" :
      index < 45 ? "intermediate" :
      index < 60 ? "advanced" : "pro";
    const content = getTopicContent(item.title, item.track);

    return {
      id,
      track: item.track,
      title: item.title,
      difficulty,
      prerequisites,
      passScore: 70,
      lesson: {
        id: `${id}-lesson`,
        title: `${item.title} — real-world lesson`,
        content: content.summary,
        objectives: content.objectives,
        example: content.example,
      },
      quiz: [
        {
          id: `${id}-q1`,
          prompt: `In ${item.title}, what is the most practical first step?`,
          options: ["Memorize syntax only", "Build a tiny real example", "Skip fundamentals", "Avoid typing"],
          answerIndex: 1,
        },
        {
          id: `${id}-q2`,
          prompt: content.quizExtra.prompt,
          options: content.quizExtra.options,
          answerIndex: content.quizExtra.answerIndex,
        },
        {
          id: `${id}-q3`,
          prompt: `How does ${item.title} connect JS and TS together?`,
          options: ["It does not", "By applying concepts in both languages", "Only in backend", "Only in CSS"],
          answerIndex: 1,
        },
      ],
      challenge: {
        prompt: content.challengePrompt,
        starterCode: item.track === "javascript" ? content.starterCodeJs : content.starterCodeTs,
        expectedOutcome: "Passes challenge checks and follows production-ready patterns.",
      },
    };
  });
}

export const defaultModules = buildMixedModules();

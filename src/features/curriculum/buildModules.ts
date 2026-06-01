import { getTopicContent } from "./getTopicContent";
import { w3Syllabus } from "./w3syllabus";
import type { Module } from "./types";

export function buildMixedModules(): Module[] {
  return w3Syllabus.map((item, index) => {
    const id = `module-${index + 1}`;
    const prerequisites = index === 0 ? [] : [`module-${index}`];
    const difficulty =
      index < 20 ? "beginner" :
      index < 45 ? "intermediate" :
      index < 60 ? "advanced" : "pro";
    const content = getTopicContent(item.title, item.track);
    const language = item.track;

    return {
      id,
      track: item.track,
      title: item.title,
      difficulty,
      prerequisites,
      passScore: 70,
      lesson: {
        id: `${id}-lesson`,
        title: item.title,
        content: content.summary,
        objectives: content.objectives,
        example: content.example,
        clue:
          difficulty === "beginner"
            ? content.hint ?? `Start from the example, then implement solve() for ${item.title}.`
            : content.hint,
      },
      quiz: [
        {
          id: `${id}-q1`,
          prompt: content.quizQ1?.prompt ?? `What is the key idea behind ${item.title}?`,
          options: content.quizQ1?.options ?? ["Syntax only", "Practical behavior", "CSS", "Git"],
          answerIndex: content.quizQ1?.answerIndex ?? 1,
        },
        {
          id: `${id}-q2`,
          prompt: content.quizExtra.prompt,
          options: content.quizExtra.options,
          answerIndex: content.quizExtra.answerIndex,
        },
        {
          id: `${id}-q3`,
          prompt: content.quizQ3?.prompt ?? `How does ${item.title} relate to real projects?`,
          options: content.quizQ3?.options ?? ["It does not", "You apply it in code", "Only design", "Only tests"],
          answerIndex: content.quizQ3?.answerIndex ?? 1,
        },
      ],
      challenge: {
        prompt: content.challengePrompt,
        starterCode: language === "javascript" ? content.starterCodeJs : content.starterCodeTs,
        language,
        tests: content.tests,
        hint: content.hint,
      },
    };
  });
}

export const defaultModules = buildMixedModules();

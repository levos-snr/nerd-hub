import { getTopicContent } from "./getTopicContent";
import type { Challenge, Module } from "./types";

const defaultById = new Map<string, Module>();

export function setDefaultModulesLookup(modules: Module[]): void {
  defaultById.clear();
  for (const m of modules) defaultById.set(m.id, m);
}

function legacyChallengeToModern(
  raw: Record<string, unknown>,
  track: Module["track"],
  title: string,
): Challenge {
  const content = getTopicContent(title, track);
  const starterCode =
    (typeof raw.starterCode === "string" && raw.starterCode) ||
    (track === "javascript" ? content.starterCodeJs : content.starterCodeTs);
  return {
    prompt: (typeof raw.prompt === "string" && raw.prompt) || content.challengePrompt,
    starterCode,
    language: raw.language === "typescript" || raw.language === "javascript" ? raw.language : track,
    tests:
      Array.isArray(raw.tests) && raw.tests.length > 0
        ? (raw.tests as Challenge["tests"])
        : content.tests,
    hint: typeof raw.hint === "string" ? raw.hint : content.hint,
  };
}

export function normalizeModule(raw: Module): Module {
  const fallback = defaultById.get(raw.id);
  const challengeRaw = raw.challenge as unknown as Record<string, unknown>;
  const needsFix =
    !raw.challenge?.tests?.length ||
    !raw.challenge?.language ||
    "expectedOutcome" in (challengeRaw ?? {});

  const challenge = needsFix
    ? legacyChallengeToModern(challengeRaw ?? {}, raw.track, raw.title)
    : raw.challenge;

  return {
    ...raw,
    lesson: raw.lesson?.content ? raw.lesson : (fallback?.lesson ?? raw.lesson),
    quiz: raw.quiz?.length >= 3 ? raw.quiz : (fallback?.quiz ?? raw.quiz),
    challenge,
  };
}

import { generateTopicContent } from "../../../scripts/generate-module-content";
import { coreContent } from "./core";
import { flagshipContent } from "./flagship";
import type { TopicContent } from "./topicTypes";

export function getTopicContent(title: string, track: "javascript" | "typescript"): TopicContent {
  const flagship = flagshipContent[title];
  if (flagship) {
    return {
      ...flagship,
      example: track === "javascript" ? flagship.example : flagship.example,
    };
  }

  const core = coreContent[title];
  if (core) {
    return {
      ...core,
      example: track === "javascript" ? core.example : core.example,
    };
  }

  return generateTopicContent(title, track);
}

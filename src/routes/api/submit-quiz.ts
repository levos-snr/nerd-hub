import { createFileRoute } from "@tanstack/react-router";
import submitQuizHandler from "../../../server/handlers/submit-quiz";
import { runNodeHandler } from "../../server/run-node-handler";

export const Route = createFileRoute("/api/submit-quiz")({
  server: {
    handlers: {
      POST: ({ request }) => runNodeHandler(submitQuizHandler, request),
    },
  },
});

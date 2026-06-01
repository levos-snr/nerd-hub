import { createFileRoute } from "@tanstack/react-router";
import submitChallengeHandler from "../../../server/handlers/submit-challenge";
import { runNodeHandler } from "../../server/run-node-handler";

export const Route = createFileRoute("/api/submit-challenge")({
  server: {
    handlers: {
      POST: ({ request }) => runNodeHandler(submitChallengeHandler, request),
    },
  },
});

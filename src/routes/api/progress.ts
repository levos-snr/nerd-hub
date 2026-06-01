import { createFileRoute } from "@tanstack/react-router";
import progressHandler from "../../../server/handlers/progress";
import { runNodeHandler } from "../../server/run-node-handler";

export const Route = createFileRoute("/api/progress")({
  server: {
    handlers: {
      GET: ({ request }) => runNodeHandler(progressHandler, request),
      PATCH: ({ request }) => runNodeHandler(progressHandler, request),
      PUT: ({ request }) => runNodeHandler(progressHandler, request),
    },
  },
});

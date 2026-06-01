import { createFileRoute } from "@tanstack/react-router";
import healthHandler from "../../../server/handlers/health";
import { runNodeHandler } from "../../server/run-node-handler";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: ({ request }) => runNodeHandler(healthHandler, request),
    },
  },
});

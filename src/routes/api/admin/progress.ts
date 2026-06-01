import { createFileRoute } from "@tanstack/react-router";
import adminProgressHandler from "../../../../server/handlers/admin/progress";
import { runNodeHandler } from "../../../server/run-node-handler";

export const Route = createFileRoute("/api/admin/progress")({
  server: {
    handlers: {
      GET: ({ request }) => runNodeHandler(adminProgressHandler, request),
      PATCH: ({ request }) => runNodeHandler(adminProgressHandler, request),
    },
  },
});

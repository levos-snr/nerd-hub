import { createFileRoute } from "@tanstack/react-router";
import adminSyncHandler from "../../../../server/handlers/admin/sync";
import { runNodeHandler } from "../../../server/run-node-handler";

export const Route = createFileRoute("/api/admin/sync")({
  server: {
    handlers: {
      POST: ({ request }) => runNodeHandler(adminSyncHandler, request),
    },
  },
});

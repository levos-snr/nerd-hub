import { createFileRoute } from "@tanstack/react-router";
import adminModulesHandler from "../../../../server/handlers/admin/modules";
import { runNodeHandler } from "../../../server/run-node-handler";

export const Route = createFileRoute("/api/admin/modules")({
  server: {
    handlers: {
      GET: ({ request }) => runNodeHandler(adminModulesHandler, request),
      POST: ({ request }) => runNodeHandler(adminModulesHandler, request),
      PUT: ({ request }) => runNodeHandler(adminModulesHandler, request),
      DELETE: ({ request }) => runNodeHandler(adminModulesHandler, request),
    },
  },
});

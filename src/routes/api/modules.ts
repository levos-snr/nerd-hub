import { createFileRoute } from "@tanstack/react-router";
import modulesHandler from "../../../server/handlers/modules";
import { runNodeHandler } from "../../server/run-node-handler";

export const Route = createFileRoute("/api/modules")({
  server: {
    handlers: {
      GET: ({ request }) => runNodeHandler(modulesHandler, request),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { listModules } from "../../server/modules/repository";

export const Route = createFileRoute("/api/modules")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const modules = await listModules();
          return Response.json({ modules });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to load modules" },
            { status: 500 },
          );
        }
      },
    },
  },
});

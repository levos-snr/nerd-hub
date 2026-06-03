import { createFileRoute } from "@tanstack/react-router";
import { checkDbConnection } from "../../server/db/client";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const db = await checkDbConnection();
        const status = db.ok ? 200 : 503;
        return Response.json(
          { ok: db.ok, db: { ok: db.ok, error: db.error, driver: db.driver } },
          { status },
        );
      },
    },
  },
});

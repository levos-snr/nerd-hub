import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, requireAdmin } from "../../../server/auth/session";
import { applyRateLimit } from "../../../server/security/apiGuard";
import { syncModulesFromSource } from "../../../server/modules/repository";

export const Route = createFileRoute("/api/admin/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = applyRateLimit(request);
        if (limited) return limited;
        try {
          const user = await getSessionUser(request);
          if (!requireAdmin(user)) {
            return Response.json({ error: "Admin privileges required" }, { status: 403 });
          }
          const result = await syncModulesFromSource();
          return Response.json({ ok: true, ...result });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Sync failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});

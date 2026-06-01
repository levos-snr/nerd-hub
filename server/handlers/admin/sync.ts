import type { IncomingMessage, ServerResponse } from "node:http";
import { getSessionUser, requireAdmin } from "../../../src/server/auth/session";
import { applyRateLimit } from "../../../src/server/security/apiGuard";
import { syncModulesFromSource } from "../../../src/server/modules/repository";
import { json } from "../../../src/server/api-utils";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!applyRateLimit(req, res)) return;

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const user = await getSessionUser(req);
    if (!requireAdmin(user)) {
      json(res, 403, { error: "Admin privileges required" });
      return;
    }

    const result = await syncModulesFromSource();
    json(res, 200, { ok: true, ...result });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Sync failed" });
  }
}

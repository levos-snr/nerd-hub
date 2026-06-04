import { getSessionUser, requireAdmin } from "../../../src/server/auth/session";
import { applyRateLimit } from "../../../src/server/security/apiGuard";
import { syncModulesFromSource } from "../../../src/server/modules/repository";
import { json } from "../../../src/server/api-utils";

export default async function handler(request: Request): Promise<Response> {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const user = await getSessionUser(request);
    if (!requireAdmin(user)) {
      return json(403, { error: "Admin privileges required" });
    }

    const result = await syncModulesFromSource();
    return json(200, { ok: true, ...result });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Sync failed" });
  }
}

import type { IncomingMessage, ServerResponse } from "node:http";
import { checkDbConnection } from "../../src/server/db/client";
import { nodeJson } from "../../src/server/api-utils";

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const db = await checkDbConnection();
  const ok = db.ok;
  nodeJson(res, ok ? 200 : 503, {
    ok,
    db: { ok: db.ok, error: db.error, driver: db.driver },
  });
}

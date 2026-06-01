import type { IncomingMessage, ServerResponse } from "node:http";
import { listModules } from "../../src/server/modules/repository";
import { json } from "../../src/server/api-utils";

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const modules = await listModules();
    json(res, 200, { modules });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Failed to load modules" });
  }
}

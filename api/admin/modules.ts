import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import type { Module } from "../../src/features/curriculum/types";
import { getSessionUser, requireAdmin } from "../../src/server/auth/session";
import { deleteModule, listModules, upsertModule } from "../../src/server/modules/repository";
import { json, readJsonBody } from "../../src/server/api-utils";

const moduleSchema = z.object({
  id: z.string().min(1),
  track: z.enum(["javascript", "typescript"]),
  title: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "pro"]),
  prerequisites: z.array(z.string()).default([]),
  passScore: z.number().min(1).max(100).default(70),
  lesson: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    objectives: z.array(z.string()),
    example: z.string(),
  }),
  quiz: z.array(
    z.object({
      id: z.string(),
      prompt: z.string(),
      options: z.array(z.string()).min(2),
      answerIndex: z.number().int().min(0),
    })
  ),
  challenge: z.object({
    prompt: z.string(),
    starterCode: z.string(),
    expectedOutcome: z.string(),
  }),
});

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const user = await getSessionUser(req);
    if (!requireAdmin(user)) {
      json(res, 403, { error: "Admin privileges required" });
      return;
    }

    if (req.method === "GET") {
      json(res, 200, { modules: await listModules() });
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody<{ module: Module; orderIndex?: number }>(req);
      const module = moduleSchema.parse(body.module);
      await upsertModule(module, body.orderIndex ?? 9999);
      json(res, 201, { ok: true });
      return;
    }

    if (req.method === "PUT") {
      const body = await readJsonBody<{ module: Module; orderIndex?: number }>(req);
      const module = moduleSchema.parse(body.module);
      await upsertModule(module, body.orderIndex ?? 0);
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url ?? "", "http://localhost");
      const id = url.searchParams.get("id");
      if (!id) {
        json(res, 400, { error: "Missing id query parameter" });
        return;
      }
      await deleteModule(id);
      json(res, 200, { ok: true });
      return;
    }

    json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Admin modules API failed" });
  }
}

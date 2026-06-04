import { z } from "zod";
import type { Module } from "../../../src/features/curriculum/types";
import { getSessionUser, requireAdmin } from "../../../src/server/auth/session";
import { applyRateLimit } from "../../../src/server/security/apiGuard";
import { deleteModule, listModules, upsertModule } from "../../../src/server/modules/repository";
import { json, readJsonBody } from "../../../src/server/api-utils";

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
    clue: z.string().optional(),
  }),
  quiz: z.array(
    z.object({
      id: z.string(),
      prompt: z.string(),
      options: z.array(z.string()).min(2),
      answerIndex: z.number().int().min(0),
    }),
  ),
  challenge: z.object({
    prompt: z.string(),
    starterCode: z.string(),
    language: z.enum(["javascript", "typescript"]),
    tests: z.array(
      z.object({
        label: z.string(),
        input: z.unknown(),
        expected: z.unknown(),
      }),
    ),
    hint: z.string().optional(),
  }),
});

export default async function handler(request: Request): Promise<Response> {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  try {
    const user = await getSessionUser(request);
    if (!requireAdmin(user)) {
      return json(403, { error: "Admin privileges required" });
    }

    if (request.method === "GET") {
      return json(200, { modules: await listModules() });
    }

    if (request.method === "POST") {
      const body = await readJsonBody<{ module: Module; orderIndex?: number }>(request);
      const module = moduleSchema.parse(body.module);
      await upsertModule(module, body.orderIndex ?? 9999);
      return json(201, { ok: true });
    }

    if (request.method === "PUT") {
      const body = await readJsonBody<{ module: Module; orderIndex?: number }>(request);
      const module = moduleSchema.parse(body.module);
      await upsertModule(module, body.orderIndex ?? 0);
      return json(200, { ok: true });
    }

    if (request.method === "DELETE") {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      if (!id) {
        return json(400, { error: "Missing id query parameter" });
      }
      await deleteModule(id);
      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed" });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Admin modules API failed",
    });
  }
}

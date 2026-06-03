import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { Module } from "../../../features/curriculum/types";
import { getSessionUser, requireAdmin } from "../../../server/auth/session";
import { applyRateLimit } from "../../../server/security/apiGuard";
import { deleteModule, listModules, upsertModule } from "../../../server/modules/repository";

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

async function requireAdminUser(request: Request): Promise<Response | null> {
  const user = await getSessionUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin privileges required" }, { status: 403 });
  }
  return null;
}

export const Route = createFileRoute("/api/admin/modules")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = applyRateLimit(request);
        if (limited) return limited;
        try {
          const denied = await requireAdminUser(request);
          if (denied) return denied;
          return Response.json({ modules: await listModules() });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Admin modules API failed" },
            { status: 500 },
          );
        }
      },

      POST: async ({ request }) => {
        const limited = applyRateLimit(request);
        if (limited) return limited;
        try {
          const denied = await requireAdminUser(request);
          if (denied) return denied;
          const body = (await request.json()) as { module: Module; orderIndex?: number };
          const module = moduleSchema.parse(body.module);
          await upsertModule(module, body.orderIndex ?? 9999);
          return Response.json({ ok: true }, { status: 201 });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Admin modules API failed" },
            { status: 500 },
          );
        }
      },

      PUT: async ({ request }) => {
        const limited = applyRateLimit(request);
        if (limited) return limited;
        try {
          const denied = await requireAdminUser(request);
          if (denied) return denied;
          const body = (await request.json()) as { module: Module; orderIndex?: number };
          const module = moduleSchema.parse(body.module);
          await upsertModule(module, body.orderIndex ?? 0);
          return Response.json({ ok: true });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Admin modules API failed" },
            { status: 500 },
          );
        }
      },

      DELETE: async ({ request }) => {
        const limited = applyRateLimit(request);
        if (limited) return limited;
        try {
          const denied = await requireAdminUser(request);
          if (denied) return denied;
          const id = new URL(request.url).searchParams.get("id");
          if (!id) return Response.json({ error: "Missing id query parameter" }, { status: 400 });
          await deleteModule(id);
          return Response.json({ ok: true });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Admin modules API failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});

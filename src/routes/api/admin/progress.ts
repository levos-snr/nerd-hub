import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createInitialState } from "../../../features/gamification/engine";
import { getSessionUser, requireAdmin } from "../../../server/auth/session";
import { applyRateLimit } from "../../../server/security/apiGuard";
import { getDb } from "../../../server/db/client";
import { learnerProgress, user } from "../../../server/db/schema";
import { learnerStateToRowFields, rowToLearnerState } from "../../../server/progress/state";

const patchSchema = z.object({
  userId: z.string().min(1),
  reset: z.boolean().optional(),
  state: z
    .object({
      xp: z.number().int().min(0).optional(),
      streak: z.number().int().min(0).optional(),
      level: z.number().int().min(1).optional(),
      completedModuleIds: z.array(z.string()).optional(),
      challengePassedModuleIds: z.array(z.string()).optional(),
      lastVisitedModuleId: z.string().optional(),
    })
    .optional(),
});

export const Route = createFileRoute("/api/admin/progress")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = applyRateLimit(request);
        if (limited) return limited;
        try {
          const admin = await getSessionUser(request);
          if (!requireAdmin(admin)) {
            return Response.json({ error: "Admin privileges required" }, { status: 403 });
          }
          const db = getDb();
          const rows = await db
            .select({
              progressId: learnerProgress.id,
              userId: learnerProgress.userId,
              email: user.email,
              name: user.name,
              xp: learnerProgress.xp,
              streak: learnerProgress.streak,
              level: learnerProgress.level,
              completedModuleIds: learnerProgress.completedModuleIds,
            })
            .from(learnerProgress)
            .innerJoin(user, eq(learnerProgress.userId, user.id));
          return Response.json({ learners: rows });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Admin progress API failed" },
            { status: 500 },
          );
        }
      },

      PATCH: async ({ request }) => {
        const limited = applyRateLimit(request);
        if (limited) return limited;
        try {
          const admin = await getSessionUser(request);
          if (!requireAdmin(admin)) {
            return Response.json({ error: "Admin privileges required" }, { status: 403 });
          }
          const db = getDb();
          const body = patchSchema.parse(await request.json());
          const [existing] = await db
            .select()
            .from(learnerProgress)
            .where(eq(learnerProgress.userId, body.userId))
            .limit(1);
          if (body.reset) {
            if (!existing) {
              return Response.json({ error: "Learner progress not found" }, { status: 404 });
            }
            const fresh = createInitialState();
            await db
              .update(learnerProgress)
              .set({ ...learnerStateToRowFields(fresh), updatedAt: new Date() })
              .where(eq(learnerProgress.id, existing.id));
            return Response.json({ ok: true, state: fresh });
          }
          if (!existing) {
            return Response.json({ error: "Learner progress not found" }, { status: 404 });
          }
          const current = rowToLearnerState(existing);
          const next = {
            ...current,
            ...body.state,
            challengePassedModuleIds:
              body.state?.challengePassedModuleIds ?? current.challengePassedModuleIds,
          };
          await db
            .update(learnerProgress)
            .set({ ...learnerStateToRowFields(next), updatedAt: new Date() })
            .where(eq(learnerProgress.id, existing.id));
          return Response.json({ ok: true, state: next });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Admin progress API failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});

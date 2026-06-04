import { eq } from "drizzle-orm";
import { z } from "zod";
import { createInitialState } from "../../../src/features/gamification/engine";
import { getSessionUser, requireAdmin } from "../../../src/server/auth/session";
import { applyRateLimit } from "../../../src/server/security/apiGuard";
import { getDb } from "../../../src/server/db/client";
import { learnerProgress, user } from "../../../src/server/db/schema";
import { json, readJsonBody } from "../../../src/server/api-utils";
import { learnerStateToRowFields, rowToLearnerState } from "../../../src/server/progress/state";

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

export default async function handler(request: Request): Promise<Response> {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  try {
    const admin = await getSessionUser(request);
    if (!requireAdmin(admin)) {
      return json(403, { error: "Admin privileges required" });
    }

    const db = getDb();

    if (request.method === "GET") {
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
      return json(200, { learners: rows });
    }

    if (request.method === "PATCH") {
      const body = patchSchema.parse(await readJsonBody(request));
      const [existing] = await db
        .select()
        .from(learnerProgress)
        .where(eq(learnerProgress.userId, body.userId))
        .limit(1);

      if (body.reset) {
        const fresh = createInitialState();
        if (!existing) {
          return json(404, { error: "Learner progress not found" });
        }
        await db
          .update(learnerProgress)
          .set({ ...learnerStateToRowFields(fresh), updatedAt: new Date() })
          .where(eq(learnerProgress.id, existing.id));
        return json(200, { ok: true, state: fresh });
      }

      if (!existing) {
        return json(404, { error: "Learner progress not found" });
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
      return json(200, { ok: true, state: next });
    }

    return json(405, { error: "Method not allowed" });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Admin progress API failed",
    });
  }
}

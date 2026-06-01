import type { IncomingMessage, ServerResponse } from "node:http";
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!applyRateLimit(req, res)) return;

  try {
    const admin = await getSessionUser(req);
    if (!requireAdmin(admin)) {
      json(res, 403, { error: "Admin privileges required" });
      return;
    }

    const db = getDb();

    if (req.method === "GET") {
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
      json(res, 200, { learners: rows });
      return;
    }

    if (req.method === "PATCH") {
      const body = patchSchema.parse(await readJsonBody(req));
      const [existing] = await db
        .select()
        .from(learnerProgress)
        .where(eq(learnerProgress.userId, body.userId))
        .limit(1);

      if (body.reset) {
        const fresh = createInitialState();
        if (!existing) {
          json(res, 404, { error: "Learner progress not found" });
          return;
        }
        await db
          .update(learnerProgress)
          .set({ ...learnerStateToRowFields(fresh), updatedAt: new Date() })
          .where(eq(learnerProgress.id, existing.id));
        json(res, 200, { ok: true, state: fresh });
        return;
      }

      if (!existing) {
        json(res, 404, { error: "Learner progress not found" });
        return;
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
      json(res, 200, { ok: true, state: next });
      return;
    }

    json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Admin progress API failed" });
  }
}

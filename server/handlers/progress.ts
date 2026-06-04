import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { createInitialState, type LearnerState } from "../../src/features/gamification/engine";
import { getSessionUser, requireAdmin } from "../../src/server/auth/session";
import { applyRateLimit, isValidModuleId } from "../../src/server/security/apiGuard";
import { respondApiError } from "../../src/server/api-errors";
import { runDb } from "../../src/server/db/client";
import { DbUnavailableError } from "../../src/server/db/retry";
import { learnerProgress } from "../../src/server/db/schema";
import { json, readJsonBody } from "../../src/server/api-utils";
import { learnerStateToRowFields, rowToLearnerState } from "../../src/server/progress/state";

type PatchPayload = { lastVisitedModuleId?: string };

export default async function handler(request: Request): Promise<Response> {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  try {
    let user;
    try {
      user = await getSessionUser(request);
    } catch (error) {
      if (error instanceof DbUnavailableError) {
        return respondApiError(error, "Database unavailable");
      }
      throw error;
    }

    if (!user) {
      return json(401, { error: "Unauthorized" });
    }

    if (request.method === "GET") {
      const state = await runDb(async (db) => {
        const [row] = await db
          .select()
          .from(learnerProgress)
          .where(eq(learnerProgress.userId, user.id))
          .limit(1);
        return row ? rowToLearnerState(row) : createInitialState();
      });
      return json(200, state);
    }

    if (request.method === "PATCH") {
      const payload = await readJsonBody<PatchPayload>(request);
      if (payload.lastVisitedModuleId && !isValidModuleId(payload.lastVisitedModuleId)) {
        return json(400, { error: "Invalid module id" });
      }

      const next = await runDb(async (db) => {
        const [existing] = await db
          .select()
          .from(learnerProgress)
          .where(eq(learnerProgress.userId, user.id))
          .limit(1);
        const current = existing ? rowToLearnerState(existing) : createInitialState();
        const updated: LearnerState = {
          ...current,
          lastVisitedModuleId: payload.lastVisitedModuleId ?? current.lastVisitedModuleId,
        };
        if (!existing) {
          await db.insert(learnerProgress).values({
            id: randomUUID(),
            userId: user.id,
            ...learnerStateToRowFields(updated),
          });
        } else {
          await db
            .update(learnerProgress)
            .set({ ...learnerStateToRowFields(updated), updatedAt: new Date() })
            .where(and(eq(learnerProgress.userId, user.id), eq(learnerProgress.id, existing.id)));
        }
        return updated;
      });
      return json(200, next);
    }

    if (request.method === "PUT") {
      if (!requireAdmin(user)) {
        return json(403, { error: "Only admins can bulk-update progress" });
      }
      const payload = await readJsonBody<LearnerState>(request);
      await runDb(async (db) => {
        const [existing] = await db
          .select()
          .from(learnerProgress)
          .where(eq(learnerProgress.userId, user.id))
          .limit(1);
        if (!existing) {
          await db.insert(learnerProgress).values({
            id: randomUUID(),
            userId: user.id,
            ...learnerStateToRowFields(payload),
          });
        } else {
          await db
            .update(learnerProgress)
            .set({ ...learnerStateToRowFields(payload), updatedAt: new Date() })
            .where(and(eq(learnerProgress.userId, user.id), eq(learnerProgress.id, existing.id)));
        }
      });
      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed" });
  } catch (error) {
    return respondApiError(error, "Progress API failed");
  }
}

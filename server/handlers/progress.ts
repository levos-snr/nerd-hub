import type { IncomingMessage, ServerResponse } from "node:http";
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!applyRateLimit(req, res)) return;

  try {
    let user;
    try {
      user = await getSessionUser(req);
    } catch (error) {
      if (error instanceof DbUnavailableError) {
        respondApiError(res, error, "Database unavailable");
        return;
      }
      throw error;
    }
    if (!user) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }

    if (req.method === "GET") {
      const state = await runDb(async (db) => {
        const [row] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);
        return row ? rowToLearnerState(row) : createInitialState();
      });
      json(res, 200, state);
      return;
    }

    if (req.method === "PATCH") {
      const payload = await readJsonBody<PatchPayload>(req);
      if (payload.lastVisitedModuleId && !isValidModuleId(payload.lastVisitedModuleId)) {
        json(res, 400, { error: "Invalid module id" });
        return;
      }

      const next = await runDb(async (db) => {
        const [existing] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);
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

      json(res, 200, next);
      return;
    }

    if (req.method === "PUT") {
      if (!requireAdmin(user)) {
        json(res, 403, { error: "Only admins can bulk-update progress" });
        return;
      }
      const payload = await readJsonBody<LearnerState>(req);
      await runDb(async (db) => {
        const [existing] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);
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
      json(res, 200, { ok: true });
      return;
    }

    json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    respondApiError(res, error, "Progress API failed");
  }
}

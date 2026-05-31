import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { createInitialState, type LearnerState } from "../src/features/gamification/engine";
import { getSessionUser } from "../src/server/auth/session";
import { getDb } from "../src/server/db/client";
import { learnerProgress } from "../src/server/db/schema";
import { json, readJsonBody } from "../src/server/api-utils";
import { learnerStateToRowFields, rowToLearnerState } from "../src/server/progress/state";

type PatchPayload = { lastVisitedModuleId?: string; challengePassedModuleIds?: string[] };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }

    const db = getDb();

    if (req.method === "GET") {
      const [row] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);
      json(res, 200, row ? rowToLearnerState(row) : createInitialState());
      return;
    }

    if (req.method === "PATCH") {
      const payload = await readJsonBody<PatchPayload>(req);
      const [existing] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);
      const current = existing ? rowToLearnerState(existing) : createInitialState();
      const next: LearnerState = {
        ...current,
        lastVisitedModuleId: payload.lastVisitedModuleId ?? current.lastVisitedModuleId,
        challengePassedModuleIds:
          payload.challengePassedModuleIds ?? current.challengePassedModuleIds,
      };

      if (!existing) {
        await db.insert(learnerProgress).values({
          id: randomUUID(),
          userId: user.id,
          ...learnerStateToRowFields(next),
        });
      } else {
        await db
          .update(learnerProgress)
          .set({ ...learnerStateToRowFields(next), updatedAt: new Date() })
          .where(and(eq(learnerProgress.userId, user.id), eq(learnerProgress.id, existing.id)));
      }

      json(res, 200, next);
      return;
    }

    if (req.method === "PUT") {
      const payload = await readJsonBody<LearnerState>(req);
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

      json(res, 200, { ok: true });
      return;
    }

    json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Progress API failed" });
  }
}

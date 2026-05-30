import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { LearnerState } from "../src/features/gamification/engine";
import { getSessionUser } from "../src/server/auth/session";
import { getDb } from "../src/server/db/client";
import { learnerProgress } from "../src/server/db/schema";
import { json, readJsonBody } from "../src/server/api-utils";

const emptyState: LearnerState = {
  xp: 0,
  streak: 0,
  level: 1,
  completedModuleIds: [],
  progress: {},
};

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
      json(res, 200, row
        ? {
            xp: row.xp,
            streak: row.streak,
            level: row.level,
            completedModuleIds: row.completedModuleIds,
            progress: row.progress,
          }
        : emptyState);
      return;
    }

    if (req.method === "PUT") {
      const payload = await readJsonBody<LearnerState>(req);
      const [existing] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);

      if (!existing) {
        await db.insert(learnerProgress).values({
          id: randomUUID(),
          userId: user.id,
          xp: payload.xp ?? 0,
          streak: payload.streak ?? 0,
          level: payload.level ?? 1,
          completedModuleIds: payload.completedModuleIds ?? [],
          progress: payload.progress ?? {},
        });
      } else {
        await db
          .update(learnerProgress)
          .set({
            xp: payload.xp ?? existing.xp,
            streak: payload.streak ?? existing.streak,
            level: payload.level ?? existing.level,
            completedModuleIds: payload.completedModuleIds ?? existing.completedModuleIds,
            progress: payload.progress ?? existing.progress,
            updatedAt: new Date(),
          })
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

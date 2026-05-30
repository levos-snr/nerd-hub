import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { scoreQuiz } from "../src/features/assessment/quiz";
import { registerAttempt, type LearnerState } from "../src/features/gamification/engine";
import { getSessionUser } from "../src/server/auth/session";
import { getDb } from "../src/server/db/client";
import { learnerProgress } from "../src/server/db/schema";
import { getModuleById } from "../src/server/modules/repository";
import { json, readJsonBody } from "../src/server/api-utils";

type SubmitPayload = { moduleId: string; answers: number[] };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const user = await getSessionUser(req);
    if (!user) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }

    const payload = await readJsonBody<SubmitPayload>(req);
    const module = await getModuleById(payload.moduleId);
    if (!module) {
      json(res, 404, { error: "Module not found" });
      return;
    }

    const score = scoreQuiz(module.quiz, payload.answers);
    const db = getDb();
    const [existing] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);

    const currentState: LearnerState = existing
      ? {
          xp: existing.xp,
          streak: existing.streak,
          level: existing.level,
          completedModuleIds: existing.completedModuleIds,
          progress: existing.progress as LearnerState["progress"],
        }
      : emptyState;

    const nextState = registerAttempt(currentState, module, score);

    if (!existing) {
      await db.insert(learnerProgress).values({
        id: randomUUID(),
        userId: user.id,
        xp: nextState.xp,
        streak: nextState.streak,
        level: nextState.level,
        completedModuleIds: nextState.completedModuleIds,
        progress: nextState.progress,
      });
    } else {
      await db
        .update(learnerProgress)
        .set({
          xp: nextState.xp,
          streak: nextState.streak,
          level: nextState.level,
          completedModuleIds: nextState.completedModuleIds,
          progress: nextState.progress,
          updatedAt: new Date(),
        })
        .where(eq(learnerProgress.id, existing.id));
    }

    json(res, 200, { score, passed: score >= module.passScore, state: nextState });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Submit quiz failed" });
  }
}

const emptyState: LearnerState = {
  xp: 0,
  streak: 0,
  level: 1,
  completedModuleIds: [],
  progress: {},
};

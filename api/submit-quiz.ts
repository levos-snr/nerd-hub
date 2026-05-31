import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { scoreQuiz } from "../src/features/assessment/quiz";
import { canUnlockModule, createInitialState, registerAttempt } from "../src/features/gamification/engine";
import { getSessionUser } from "../src/server/auth/session";
import { getDb } from "../src/server/db/client";
import { learnerProgress } from "../src/server/db/schema";
import { getModuleById } from "../src/server/modules/repository";
import { json, readJsonBody } from "../src/server/api-utils";
import { learnerStateToRowFields, rowToLearnerState } from "../src/server/progress/state";

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

    const currentState = existing ? rowToLearnerState(existing) : createInitialState();

    if (!canUnlockModule(module, currentState.completedModuleIds)) {
      json(res, 403, { error: "Module is locked" });
      return;
    }

    const nextState = registerAttempt(currentState, module, score);

    if (!existing) {
      await db.insert(learnerProgress).values({
        id: randomUUID(),
        userId: user.id,
        ...learnerStateToRowFields(nextState),
      });
    } else {
      await db
        .update(learnerProgress)
        .set({ ...learnerStateToRowFields(nextState), updatedAt: new Date() })
        .where(eq(learnerProgress.id, existing.id));
    }

    json(res, 200, { score, passed: score >= module.passScore, state: nextState });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Submit quiz failed" });
  }
}

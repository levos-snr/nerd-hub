import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { scoreQuiz } from "../../src/features/assessment/quiz";
import { canUnlockModule, createInitialState, registerAttempt } from "../../src/features/gamification/engine";
import { getSessionUser } from "../../src/server/auth/session";
import { applyRateLimit, sanitizeModuleIdPayload } from "../../src/server/security/apiGuard";
import { isChallengePassed } from "../../src/features/gamification/engine";
import { respondApiError } from "../../src/server/api-errors";
import { runDb } from "../../src/server/db/client";
import { DbUnavailableError } from "../../src/server/db/retry";
import { learnerProgress } from "../../src/server/db/schema";
import { getModuleById } from "../../src/server/modules/repository";
import { json, readJsonBody } from "../../src/server/api-utils";
import { learnerStateToRowFields, rowToLearnerState } from "../../src/server/progress/state";

type SubmitPayload = { moduleId: string; answers: number[] };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

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

    const payload = await readJsonBody<SubmitPayload>(req);
    const moduleId = sanitizeModuleIdPayload(payload.moduleId);
    if (!moduleId) {
      json(res, 400, { error: "Invalid module id" });
      return;
    }
    const module = await getModuleById(moduleId);
    if (!module) {
      json(res, 404, { error: "Module not found" });
      return;
    }

    const score = scoreQuiz(module.quiz, payload.answers);

    const { nextState } = await runDb(async (db) => {
      const [existing] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);

      const currentState = existing ? rowToLearnerState(existing) : createInitialState();

      if (!canUnlockModule(module, currentState.completedModuleIds)) {
        throw Object.assign(new Error("Module is locked"), { statusCode: 403 });
      }

      if (!isChallengePassed(currentState, moduleId)) {
        throw Object.assign(new Error("Complete the coding challenge before submitting the quiz"), {
          statusCode: 403,
        });
      }

      if (payload.answers.length !== module.quiz.length) {
        throw Object.assign(new Error("Invalid answer count"), { statusCode: 400 });
      }

      const state = registerAttempt(currentState, module, score);

      if (!existing) {
        await db.insert(learnerProgress).values({
          id: randomUUID(),
          userId: user.id,
          ...learnerStateToRowFields(state),
        });
      } else {
        await db
          .update(learnerProgress)
          .set({ ...learnerStateToRowFields(state), updatedAt: new Date() })
          .where(eq(learnerProgress.id, existing.id));
      }

      return { nextState: state };
    });

    json(res, 200, { score, passed: score >= module.passScore, state: nextState });
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: number }).statusCode)
        : 0;
    if (statusCode === 403 || statusCode === 400) {
      json(res, statusCode, { error: error instanceof Error ? error.message : "Request failed" });
      return;
    }
    respondApiError(res, error, "Submit quiz failed");
  }
}

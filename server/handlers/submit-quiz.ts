import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { scoreQuiz } from "../../src/features/assessment/quiz";
import {
  canUnlockModule,
  createInitialState,
  registerAttempt,
  isChallengePassed,
} from "../../src/features/gamification/engine";
import { getSessionUser } from "../../src/server/auth/session";
import { applyRateLimit, sanitizeModuleIdPayload } from "../../src/server/security/apiGuard";
import { respondApiError } from "../../src/server/api-errors";
import { runDb } from "../../src/server/db/client";
import { DbUnavailableError } from "../../src/server/db/retry";
import { learnerProgress } from "../../src/server/db/schema";
import { getModuleById } from "../../src/server/modules/repository";
import { json, readJsonBody } from "../../src/server/api-utils";
import { learnerStateToRowFields, rowToLearnerState } from "../../src/server/progress/state";

type SubmitPayload = { moduleId: string; answers: number[] };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

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

    const payload = await readJsonBody<SubmitPayload>(request);
    const moduleId = sanitizeModuleIdPayload(payload.moduleId);
    if (!moduleId) {
      return json(400, { error: "Invalid module id" });
    }

    const module = await getModuleById(moduleId);
    if (!module) {
      return json(404, { error: "Module not found" });
    }

    const score = scoreQuiz(module.quiz, payload.answers);
    const { nextState } = await runDb(async (db) => {
      const [existing] = await db
        .select()
        .from(learnerProgress)
        .where(eq(learnerProgress.userId, user.id))
        .limit(1);
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

    return json(200, { score, passed: score >= module.passScore, state: nextState });
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: number }).statusCode)
        : 0;
    if (statusCode === 403 || statusCode === 400) {
      return json(statusCode, { error: error instanceof Error ? error.message : "Request failed" });
    }
    return respondApiError(error, "Submit quiz failed");
  }
}

import { createFileRoute } from "@tanstack/react-router";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { scoreQuiz } from "../../features/assessment/quiz";
import {
  canUnlockModule,
  createInitialState,
  isChallengePassed,
  registerAttempt,
} from "../../features/gamification/engine";
import { getSessionUser } from "../../server/auth/session";
import { applyRateLimit, sanitizeModuleIdPayload } from "../../server/security/apiGuard";
import { respondApiError } from "../../server/api-errors";
import { runDb } from "../../server/db/client";
import { DbUnavailableError } from "../../server/db/retry";
import { learnerProgress } from "../../server/db/schema";
import { getModuleById } from "../../server/modules/repository";
import { learnerStateToRowFields, rowToLearnerState } from "../../server/progress/state";

type SubmitPayload = { moduleId: string; answers: number[] };

export const Route = createFileRoute("/api/submit-quiz")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = applyRateLimit(request);
        if (limited) return limited;
        let user;
        try {
          user = await getSessionUser(request);
        } catch (error) {
          if (error instanceof DbUnavailableError)
            return respondApiError(error, "Database unavailable");
          throw error;
        }
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        try {
          const payload = (await request.json()) as SubmitPayload;
          const moduleId = sanitizeModuleIdPayload(payload.moduleId);
          if (!moduleId) return Response.json({ error: "Invalid module id" }, { status: 400 });
          const module = await getModuleById(moduleId);
          if (!module) return Response.json({ error: "Module not found" }, { status: 404 });
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
              throw Object.assign(
                new Error("Complete the coding challenge before submitting the quiz"),
                { statusCode: 403 },
              );
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
          return Response.json({ score, passed: score >= module.passScore, state: nextState });
        } catch (error) {
          const statusCode =
            error && typeof error === "object" && "statusCode" in error
              ? Number((error as { statusCode: number }).statusCode)
              : 0;
          if (statusCode === 403 || statusCode === 400) {
            return Response.json(
              { error: error instanceof Error ? error.message : "Request failed" },
              { status: statusCode },
            );
          }
          return respondApiError(error, "Submit quiz failed");
        }
      },
    },
  },
});

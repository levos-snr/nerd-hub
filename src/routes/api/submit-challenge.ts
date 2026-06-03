import { createFileRoute } from "@tanstack/react-router";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  canUnlockModule,
  createInitialState,
  markChallengePassed,
} from "../../features/gamification/engine";
import { getSessionUser } from "../../server/auth/session";
import { applyRateLimit, sanitizeModuleIdPayload } from "../../server/security/apiGuard";
import { respondApiError } from "../../server/api-errors";
import { runDb } from "../../server/db/client";
import { DbUnavailableError } from "../../server/db/retry";
import { learnerProgress } from "../../server/db/schema";
import { getModuleById } from "../../server/modules/repository";
import { learnerStateToRowFields, rowToLearnerState } from "../../server/progress/state";

type Payload = { moduleId: string };

export const Route = createFileRoute("/api/submit-challenge")({
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
          const body = (await request.json()) as Payload;
          const moduleId = sanitizeModuleIdPayload(body.moduleId);
          if (!moduleId) return Response.json({ error: "Invalid module id" }, { status: 400 });
          const module = await getModuleById(moduleId);
          if (!module) return Response.json({ error: "Module not found" }, { status: 404 });
          const next = await runDb(async (db) => {
            const [existing] = await db
              .select()
              .from(learnerProgress)
              .where(eq(learnerProgress.userId, user.id))
              .limit(1);
            const current = existing ? rowToLearnerState(existing) : createInitialState();
            if (!canUnlockModule(module, current.completedModuleIds)) {
              throw Object.assign(new Error("Module is locked"), { statusCode: 403 });
            }
            const state = markChallengePassed(current, moduleId);
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
            return state;
          });
          return Response.json({ ok: true, state: next });
        } catch (error) {
          const statusCode =
            error && typeof error === "object" && "statusCode" in error
              ? Number((error as { statusCode: number }).statusCode)
              : 0;
          if (statusCode === 403) {
            return Response.json(
              { error: error instanceof Error ? error.message : "Forbidden" },
              { status: 403 },
            );
          }
          return respondApiError(error, "Submit challenge failed");
        }
      },
    },
  },
});

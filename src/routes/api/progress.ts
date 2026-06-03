import { createFileRoute } from "@tanstack/react-router";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { createInitialState, type LearnerState } from "../../features/gamification/engine";
import { getSessionUser, requireAdmin } from "../../server/auth/session";
import { applyRateLimit, isValidModuleId } from "../../server/security/apiGuard";
import { respondApiError } from "../../server/api-errors";
import { runDb } from "../../server/db/client";
import { DbUnavailableError } from "../../server/db/retry";
import { learnerProgress } from "../../server/db/schema";
import { learnerStateToRowFields, rowToLearnerState } from "../../server/progress/state";

type PatchPayload = { lastVisitedModuleId?: string };

export const Route = createFileRoute("/api/progress")({
  server: {
    handlers: {
      GET: async ({ request }) => {
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
        const state = await runDb(async (db) => {
          const [row] = await db
            .select()
            .from(learnerProgress)
            .where(eq(learnerProgress.userId, user.id))
            .limit(1);
          return row ? rowToLearnerState(row) : createInitialState();
        });
        return Response.json(state);
      },

      PATCH: async ({ request }) => {
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
          const payload = (await request.json()) as PatchPayload;
          if (payload.lastVisitedModuleId && !isValidModuleId(payload.lastVisitedModuleId)) {
            return Response.json({ error: "Invalid module id" }, { status: 400 });
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
                .where(
                  and(eq(learnerProgress.userId, user.id), eq(learnerProgress.id, existing.id)),
                );
            }
            return updated;
          });
          return Response.json(next);
        } catch (error) {
          return respondApiError(error, "Progress API failed");
        }
      },

      PUT: async ({ request }) => {
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
        if (!requireAdmin(user)) {
          return Response.json({ error: "Only admins can bulk-update progress" }, { status: 403 });
        }
        try {
          const payload = (await request.json()) as LearnerState;
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
                .where(
                  and(eq(learnerProgress.userId, user.id), eq(learnerProgress.id, existing.id)),
                );
            }
          });
          return Response.json({ ok: true });
        } catch (error) {
          return respondApiError(error, "Progress API failed");
        }
      },
    },
  },
});

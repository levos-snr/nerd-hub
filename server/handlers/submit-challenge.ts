import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  canUnlockModule,
  createInitialState,
  markChallengePassed,
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

type Payload = { moduleId: string };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!applyRateLimit(req, res)) return;

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

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

    const body = await readJsonBody<Payload>(req);
    const moduleId = sanitizeModuleIdPayload(body.moduleId);
    if (!moduleId) {
      json(res, 400, { error: "Invalid module id" });
      return;
    }
    const module = await getModuleById(moduleId);
    if (!module) {
      json(res, 404, { error: "Module not found" });
      return;
    }

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

    json(res, 200, { ok: true, state: next });
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: number }).statusCode)
        : 0;
    if (statusCode === 403) {
      json(res, 403, { error: error instanceof Error ? error.message : "Forbidden" });
      return;
    }
    respondApiError(res, error, "Submit challenge failed");
  }
}

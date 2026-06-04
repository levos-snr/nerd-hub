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

export default async function handler(request: Request): Promise<Response> {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

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

    const body = await readJsonBody<Payload>(request);
    const moduleId = sanitizeModuleIdPayload(body.moduleId);
    if (!moduleId) {
      return json(400, { error: "Invalid module id" });
    }

    const module = await getModuleById(moduleId);
    if (!module) {
      return json(404, { error: "Module not found" });
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

    return json(200, { ok: true, state: next });
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: number }).statusCode)
        : 0;
    if (statusCode === 403) {
      return json(403, { error: error instanceof Error ? error.message : "Forbidden" });
    }
    return respondApiError(error, "Submit challenge failed");
  }
}

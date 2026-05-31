import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { canUnlockModule, createInitialState, markChallengePassed } from "../src/features/gamification/engine";
import { getSessionUser } from "../src/server/auth/session";
import { getDb } from "../src/server/db/client";
import { learnerProgress } from "../src/server/db/schema";
import { getModuleById } from "../src/server/modules/repository";
import { json, readJsonBody } from "../src/server/api-utils";
import { learnerStateToRowFields, rowToLearnerState } from "../src/server/progress/state";

type Payload = { moduleId: string };

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

    const { moduleId } = await readJsonBody<Payload>(req);
    const module = await getModuleById(moduleId);
    if (!module) {
      json(res, 404, { error: "Module not found" });
      return;
    }

    const db = getDb();
    const [existing] = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, user.id)).limit(1);
    const current = existing ? rowToLearnerState(existing) : createInitialState();

    if (!canUnlockModule(module, current.completedModuleIds)) {
      json(res, 403, { error: "Module is locked" });
      return;
    }

    const next = markChallengePassed(current, moduleId);

    if (!existing) {
      await db.insert(learnerProgress).values({
        id: randomUUID(),
        userId: user.id,
        ...learnerStateToRowFields(next),
      });
    } else {
      await db
        .update(learnerProgress)
        .set({ ...learnerStateToRowFields(next), updatedAt: new Date() })
        .where(eq(learnerProgress.id, existing.id));
    }

    json(res, 200, { ok: true, state: next });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Submit challenge failed" });
  }
}

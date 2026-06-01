import { asc, eq } from "drizzle-orm";
import { defaultModules } from "../../features/curriculum/buildModules";
import { normalizeModule, setDefaultModulesLookup } from "../../features/curriculum/normalizeModule";
import type { Module } from "../../features/curriculum/types";

setDefaultModulesLookup(defaultModules);
import { runDb } from "../db/client";
import { curriculumModules as modulesTable } from "../db/schema";

function rowToModule(row: typeof modulesTable.$inferSelect): Module {
  return normalizeModule(row.payload as unknown as Module);
}

export async function ensureModulesSeeded(): Promise<void> {
  await runDb(async (db) => {
    const existing = await db.select({ id: modulesTable.id }).from(modulesTable).limit(1);
    if (existing.length > 0) return;

    await db.insert(modulesTable).values(
      defaultModules.map((module, index) => ({
        id: module.id,
        track: module.track,
        title: module.title,
        difficulty: module.difficulty,
        orderIndex: index,
        prerequisites: module.prerequisites,
        passScore: module.passScore,
        payload: module as unknown as Record<string, unknown>,
      })),
    );
  });
}

export async function listModules(): Promise<Module[]> {
  await ensureModulesSeeded();
  return runDb(async (db) => {
    const rows = await db.select().from(modulesTable).orderBy(asc(modulesTable.orderIndex));
    return rows.map(rowToModule);
  });
}

export async function getModuleById(id: string): Promise<Module | undefined> {
  await ensureModulesSeeded();
  return runDb(async (db) => {
    const [row] = await db.select().from(modulesTable).where(eq(modulesTable.id, id)).limit(1);
    return row ? rowToModule(row) : undefined;
  });
}

export async function upsertModule(module: Module, orderIndex: number): Promise<void> {
  await runDb(async (db) => {
    const [existing] = await db.select().from(modulesTable).where(eq(modulesTable.id, module.id)).limit(1);
    const values = {
      id: module.id,
      track: module.track,
      title: module.title,
      difficulty: module.difficulty,
      orderIndex,
      prerequisites: module.prerequisites,
      passScore: module.passScore,
      payload: module as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(modulesTable).set(values).where(eq(modulesTable.id, module.id));
    } else {
      await db.insert(modulesTable).values(values);
    }
  });
}

export async function deleteModule(id: string): Promise<void> {
  await runDb(async (db) => {
    await db.delete(modulesTable).where(eq(modulesTable.id, id));
  });
}

export async function syncModulesFromSource(): Promise<{ upserted: number }> {
  let upserted = 0;
  for (const [index, module] of defaultModules.entries()) {
    await upsertModule(module, index);
    upserted++;
  }
  return { upserted };
}

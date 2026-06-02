import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { resolveDatabaseDriver, resolveDatabaseUrl } from "./resolve-connection";
import { DbUnavailableError, withDbRetry } from "./retry";

type AppDb =
  | ReturnType<typeof drizzleNeon<typeof schema>>
  | ReturnType<typeof drizzlePostgres<typeof schema>>;

let db: AppDb | null = null;
let sql: ReturnType<typeof postgres> | null = null;

function shouldUseNeonHttp(url: string): boolean {
  return resolveDatabaseDriver(url) === "neon-http";
}

export function getDb(): AppDb {
  if (db) return db;

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL is required. See .env.example for setup.");
  }

  const databaseUrl = resolveDatabaseUrl(rawUrl);

  if (shouldUseNeonHttp(rawUrl)) {
    neonConfig.fetchConnectionCache = true;
    const sqlNeon = neon(databaseUrl);
    db = drizzleNeon(sqlNeon, { schema });
    return db;
  }

  sql = postgres(databaseUrl, {
    prepare: false,
    max: 10,
    connect_timeout: 30,
    idle_timeout: 30,
    max_lifetime: 60 * 30,
  });
  db = drizzlePostgres(sql, { schema });
  return db;
}

/** Wrap Drizzle/API work so transient Neon errors retry instead of failing the request. */
export function runDb<T>(fn: (database: AppDb) => Promise<T>): Promise<T> {
  return withDbRetry(async () => fn(getDb()));
}

export async function checkDbConnection(): Promise<{
  ok: boolean;
  error?: string;
  driver?: string;
}> {
  try {
    return await withDbRetry(async () => {
      const rawUrl = process.env.DATABASE_URL;
      if (!rawUrl) {
        return { ok: false, error: "DATABASE_URL is not set" };
      }
      const driver = resolveDatabaseDriver(rawUrl);
      const databaseUrl = resolveDatabaseUrl(rawUrl);
      if (driver === "neon-http") {
        await neon(databaseUrl)`SELECT 1`;
      } else {
        getDb();
        if (!sql) throw new Error("Database client not initialized");
        await sql`SELECT 1`;
      }
      return { ok: true, driver };
    });
  } catch (error) {
    const rawUrl = process.env.DATABASE_URL ?? "";
    const driver = rawUrl ? resolveDatabaseDriver(rawUrl) : "postgres";
    if (error instanceof DbUnavailableError) {
      return {
        ok: false,
        error: error.message,
        driver,
      };
    }
    const message = error instanceof Error ? error.message : "Database unreachable";
    return { ok: false, error: message, driver };
  }
}

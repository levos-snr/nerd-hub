import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type AppDb =
  | ReturnType<typeof drizzleNeon<typeof schema>>
  | ReturnType<typeof drizzlePostgres<typeof schema>>;

let db: AppDb | null = null;
let sql: ReturnType<typeof postgres> | null = null;

function shouldUseNeonHttp(): boolean {
  if (process.env.DATABASE_DRIVER === "postgres") return false;
  if (process.env.DATABASE_DRIVER === "neon-http") return true;
  if (process.env.VERCEL) return true;
  const url = process.env.DATABASE_URL ?? "";
  return url.includes("neon.tech") || url.includes("neon.database");
}

export function getDb(): AppDb {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. See .env.example for setup.");
  }

  if (shouldUseNeonHttp()) {
    const sqlNeon = neon(databaseUrl);
    db = drizzleNeon(sqlNeon, { schema });
    return db;
  }

  sql = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    connect_timeout: 15,
    idle_timeout: 20,
  });
  db = drizzlePostgres(sql, { schema });
  return db;
}

export async function checkDbConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return { ok: false, error: "DATABASE_URL is not set" };
    }
    if (shouldUseNeonHttp()) {
      await neon(databaseUrl)`SELECT 1`;
    } else {
      getDb();
      if (!sql) throw new Error("Database client not initialized");
      await sql`SELECT 1`;
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database unreachable";
    if (message.includes("ETIMEDOUT") || message.includes("ECONNREFUSED")) {
      return { ok: false, error: "Cannot reach database. Check DATABASE_URL and network." };
    }
    return { ok: false, error: message };
  }
}

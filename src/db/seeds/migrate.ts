import "../../lib/load-env.js";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import {
  isPoolerDatabaseUrl,
  resolveDatabaseDriver,
  resolveDatabaseUrl,
} from "../../server/db/resolve-connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../../../drizzle");
const journalPath = path.join(migrationsFolder, "meta/_journal.json");

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) {
  console.error("DATABASE_URL is required. Copy .env.example to .env and set your Neon URL.");
  process.exit(1);
}

if (!existsSync(journalPath)) {
  console.error(
    `Missing ${journalPath}. Run "pnpm db:generate" after schema changes, or restore drizzle/meta/_journal.json.`,
  );
  process.exit(1);
}

const driver = resolveDatabaseDriver(rawDatabaseUrl);
const databaseUrl = resolveDatabaseUrl(rawDatabaseUrl, { forMigrations: true, driver });

console.log(`Migrating with driver: ${driver}`);
if (isPoolerDatabaseUrl(rawDatabaseUrl) && driver === "postgres") {
  console.log("Using direct Neon host for migrations (pooler cannot run DDL).");
}
console.log(`Migrations folder: ${migrationsFolder}`);

function formatError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const parts = [error.message];
  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error && cause.message && cause.message !== error.message) {
    parts.push(`Cause: ${cause.message}`);
  }
  return parts.join("\n");
}

try {
  if (driver === "neon-http") {
    const sql = neon(databaseUrl);
    const db = drizzleNeon(sql);
    await migrate(db, { migrationsFolder });
  } else {
    const sql = postgres(databaseUrl, { prepare: false, max: 1, connect_timeout: 30 });
    try {
      const db = drizzlePostgres(sql);
      await migratePostgres(db, { migrationsFolder });
    } finally {
      await sql.end();
    }
  }
  console.log("✅ Database migrations applied.");
} catch (error) {
  console.error("❌ Migration failed:", formatError(error));
  if (isPoolerDatabaseUrl(rawDatabaseUrl) && driver === "neon-http") {
    console.error(
      "Tip: keep DATABASE_URL as Neon provides it; neon-http works with pooled URLs for migrations.",
    );
  } else if (isPoolerDatabaseUrl(rawDatabaseUrl)) {
    console.error(
      "Tip: use DATABASE_DRIVER=neon-http in .env, or a direct (non-pooler) DATABASE_URL for migrations.",
    );
  }
  process.exit(1);
}

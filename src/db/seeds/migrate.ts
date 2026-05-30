import "../../lib/load-env.js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(databaseUrl, { prepare: false, max: 1 });
const drizzleDir = path.resolve("drizzle");
const files = (await readdir(drizzleDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  const migration = await readFile(path.join(drizzleDir, file), "utf-8");
  await sql.unsafe(migration);
  console.log(`Applied ${file}`);
}

await sql.end();
console.log("Database migrations applied.");

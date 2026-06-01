import "../../lib/load-env.js";
import { syncModulesFromSource } from "../../server/modules/repository";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Copy .env.example to .env and set your Neon URL.");
  process.exit(1);
}

console.log("Syncing curriculum modules to database…");

try {
  const result = await syncModulesFromSource();
  console.log(`✅ Synced ${result.upserted} modules from source.`);
} catch (error) {
  console.error("❌ Module sync failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}

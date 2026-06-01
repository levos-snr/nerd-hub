import "../../lib/load-env.js";
import { checkDbConnection } from "../../server/db/client";
import { isPoolerDatabaseUrl, resolveDatabaseDriver } from "../../server/db/resolve-connection";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const driver = resolveDatabaseDriver(url);
console.log(`Driver: ${driver}${isPoolerDatabaseUrl(url) ? " (pooled Neon URL)" : ""}`);

const result = await checkDbConnection();
if (result.ok) {
  console.log(`✅ Database reachable (${result.driver})`);
} else {
  console.error(`❌ ${result.error}`);
  process.exit(1);
}

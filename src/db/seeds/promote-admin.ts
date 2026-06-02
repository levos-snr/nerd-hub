import "../../lib/load-env.js";
import { eq } from "drizzle-orm";
import { getDb } from "../../server/db/client";
import { user } from "../../server/db/schema";

const email = process.env.ADMIN_EMAIL;
if (!email) {
  console.error("ADMIN_EMAIL is required");
  process.exit(1);
}

const db = getDb();
await db.update(user).set({ role: "admin", updatedAt: new Date() }).where(eq(user.email, email));
const updated = await db
  .select({ email: user.email })
  .from(user)
  .where(eq(user.email, email))
  .limit(1);
if (updated.length === 0) {
  console.error(`No user found for ${email}`);
  process.exit(1);
}
console.log(`Promoted ${email} to admin.`);

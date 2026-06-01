import "../../lib/load-env.js";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { admin } from "better-auth/plugins";
import { getDb } from "../../server/db/client";
import * as schema from "../../server/db/schema";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [baseURL],
  plugins: [
    admin({
      defaultRole: "learner",
      adminRoles: ["admin"],
    }),
    tanstackStartCookies(),
  ],
});

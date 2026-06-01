import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? env.DATABASE_URL;
  process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? env.BETTER_AUTH_SECRET;
  process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? env.BETTER_AUTH_URL ?? "http://localhost:3000";

  return {
    plugins: [
      tanstackStart(),
      nitro({
        preset: "vercel",
        rollupConfig: {
          external: [
            "better-auth",
            "@better-auth/kysely-adapter",
            "@better-auth/drizzle-adapter",
            "kysely",
          ],
        },
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@better-auth/kysely-adapter": path.join(rootDir, "src/lib/empty-module.ts"),
      },
    },
    server: { port: 3000 },
    ssr: {
      external: [
        "better-auth",
        "better-auth/node",
        "better-auth/tanstack-start",
        "better-auth/plugins",
        "@better-auth/drizzle-adapter",
        "@better-auth/kysely-adapter",
        "@better-auth/core",
        "kysely",
        "@neondatabase/serverless",
        "postgres",
        "drizzle-orm",
      ],
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
      exclude: ["tests/e2e/**"],
    },
  };
});

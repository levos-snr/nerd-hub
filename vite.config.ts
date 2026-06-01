import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? env.DATABASE_URL;
  process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? env.BETTER_AUTH_SECRET;
  process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? env.BETTER_AUTH_URL ?? "http://localhost:3000";

  return {
    plugins: [
      tanstackStart(),
      nitro({ preset: "vercel" }),
      react(),
      tailwindcss(),
    ],
    server: { port: 3000 },
    // Bundle server deps into Vercel output — externalized imports are not in /var/task/node_modules.
    ssr: {
      noExternal: [
        "better-auth",
        /^better-auth\//,
        "@better-auth/drizzle-adapter",
        "@better-auth/core",
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

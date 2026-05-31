import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { vercelApiDevPlugin } from "./src/server/vite-api-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? env.DATABASE_URL;
  process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? env.BETTER_AUTH_SECRET;
  process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (!process.env.DATABASE_DRIVER && (dbUrl.includes("neon.tech") || dbUrl.includes("neon.database"))) {
    process.env.DATABASE_DRIVER = "neon-http";
  }

  return {
    plugins: [react(), tailwindcss(), vercelApiDevPlugin()],
    server: { port: 3000 },
    test: {
      environment: "jsdom",
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
      exclude: ["tests/e2e/**"],
    },
  };
});

import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

/** E2E smoke tests — router plugin only (no code splitting / no duplicate `hot` injection). */
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: false,
    }),
    react(),
    tailwindcss(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/e2e/**/*.test.ts"],
    pool: "forks",
  },
});

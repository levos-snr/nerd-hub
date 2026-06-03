import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

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
    server: {
      deps: {
        inline: ["react", "react-dom"],
      },
    },
  },
});

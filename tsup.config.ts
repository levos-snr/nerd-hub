import { defineConfig } from "tsup";
import { readdirSync, statSync } from "fs";
import { join } from "path";

// Collect all .ts files under /api recursively
function collectEntries(dir: string): string[] {
  const entries: string[] = [];
  for (const file of readdirSync(dir)) {
    const full = join(dir, file);
    if (statSync(full).isDirectory()) {
      entries.push(...collectEntries(full));
    } else if (file.endsWith(".ts")) {
      entries.push(full);
    }
  }
  return entries;
}

export default defineConfig({
  entry: collectEntries("api"),
  outDir: "api-dist",
  format: ["cjs"],
  target: "node22",
  splitting: false,
  bundle: true,
  sourcemap: false,
  dts: false,
  // Keep each file as its own output matching the input structure
  outExtension: () => ({ js: ".js" }),
});

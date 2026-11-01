import { defineConfig } from "vite-plus";
import { resolve } from "node:path";

export default defineConfig({
  oxc: { decorator: { legacy: true } },
  resolve: { alias: { "@": resolve(import.meta.dirname, "plugin/src") } },
  test: { include: ["plugin/**/*.test.ts", "property-inspector/**/*.test.ts"] },
});

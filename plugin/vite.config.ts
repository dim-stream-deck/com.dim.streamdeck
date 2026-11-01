import { defineConfig, loadEnv } from "vite-plus";
import { builtinModules, createRequire } from "node:module";
import { cp, copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const output = "com.dim.streamdeck.sdPlugin";
const envKeys = [
  "AXIOM_DATASET",
  "AXIOM_TOKEN",
  "CHECKPOINT_API",
  "CHECKPOINT_API_KEY",
  "CHECKPOINT_HOST",
  "STREAM_DECK_ENV",
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // Elgato action decorators only wrap the class; Node does not parse decorator syntax.
    oxc: { decorator: { legacy: true } },
    resolve: {
      alias: { "@": resolve(import.meta.dirname, "src") },
      conditions: ["node"],
      mainFields: ["module", "main"],
    },
    define: Object.fromEntries(
      envKeys.map((key) => [`process.env.${key}`, JSON.stringify(env[key]) ?? "undefined"]),
    ),
    build: {
      target: "node26",
      sourcemap: mode === "development",
      minify: mode !== "development",
      outDir: `${output}/bin`,
      emptyOutDir: true,
      lib: { entry: "src/plugin.ts", formats: ["cjs"], fileName: () => "plugin.js" },
      rolldownOptions: {
        platform: "node",
        external: [...builtinModules, /^node:/, "bufferutil", "utf-8-validate"],
        output: { codeSplitting: false },
      },
    },
    plugins: [
      {
        name: "streamdeck-assets",
        buildStart() {
          this.addWatchFile(`${output}/manifest.json`);
        },
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "package.json",
            source: JSON.stringify({ type: "commonjs", main: "plugin.js" }),
          });
        },
        async writeBundle() {
          const clipboard = dirname(require.resolve("clipboardy"));
          await mkdir(`${output}/fallbacks`, { recursive: true });
          await cp(resolve(clipboard, "fallbacks"), `${output}/fallbacks`, { recursive: true });
          await copyFile(
            require.resolve("canvaskit-wasm/bin/canvaskit.wasm"),
            `${output}/canvaskit.wasm`,
          );
          if (this.meta.watchMode) {
            execFileSync("streamdeck", ["restart", "com.dim.streamdeck"], { stdio: "inherit" });
          }
        },
      },
    ],
  };
});

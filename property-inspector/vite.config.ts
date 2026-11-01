import { defineConfig } from "vite-plus";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  base: "./",
  build: {
    target: "chrome130",
    emptyOutDir: true,
    outDir: "../plugin/com.dim.streamdeck.sdPlugin/pi",
  },
});

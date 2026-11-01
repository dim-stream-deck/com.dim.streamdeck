import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ compiler: true })],
  base: "./",
  build: {
    target: "chrome130",
    emptyOutDir: true,
    outDir: "../plugin/com.dim.streamdeck.sdPlugin/pi",
  },
});

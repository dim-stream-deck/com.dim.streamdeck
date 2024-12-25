import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
  ],
  base: "./",
  build: {
    emptyOutDir: true,
    outDir: "../plugin/com.dim.streamdeck.sdPlugin/pi",
  },
});

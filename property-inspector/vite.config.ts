import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  base: "./",
  build: {
    emptyOutDir: true,
    outDir: "../plugin/com.dim.streamdeck.sdPlugin/pi",
  },
});

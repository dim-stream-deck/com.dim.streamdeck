import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import path from "node:path";
import url from "node:url";
import copy from "rollup-plugin-copy";
import { swc } from "rollup-plugin-swc3";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import dotenv from "rollup-plugin-dotenv";

const uuid = "com.dim.streamdeck";
const isWatching = !!process.env.ROLLUP_WATCH;
const sdPlugin = `${uuid}.sdPlugin`;

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: "src/plugin.ts",
  output: {
    file: `${sdPlugin}/bin/plugin.js`,
    format: "cjs",
    sourcemap: isWatching,
    sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
      return url.pathToFileURL(
        path.resolve(path.dirname(sourcemapPath), relativeSourcePath)
      ).href;
    },
  },
  onwarn: (warning, warn) => {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    warn(warning);
  },
  plugins: [
    dotenv(),
    replace({
      // Axiom
      "process.env.AXIOM_DATASET": JSON.stringify(process.env.AXIOM_DATASET),
      "process.env.AXIOM_TOKEN": JSON.stringify(process.env.AXIOM_TOKEN),
      // Checkpoint
      "process.env.CHECKPOINT_API": JSON.stringify(process.env.CHECKPOINT_API),
      "process.env.CHECKPOINT_API_KEY": JSON.stringify(
        process.env.CHECKPOINT_API_KEY
      ),
      "process.env.CHECKPOINT_HOST": JSON.stringify(
        process.env.CHECKPOINT_HOST
      ),
      // Env
      "process.env.STREAM_DECK_ENV": JSON.stringify(
        process.env.STREAM_DECK_ENV
      ),
      preventAssignment: true,
    }),
    copy({
      copyOnce: true,
      hook: isWatching ? "buildStart" : "writeBundle",
      targets: [
        {
          src: "../node_modules/clipboardy/fallbacks/windows",
          dest: `${sdPlugin}/fallbacks/`,
        },
        {
          src: "../node_modules/canvaskit-wasm/bin/canvaskit.wasm",
          dest: sdPlugin,
        },
      ],
    }),
    isWatching && {
      name: "watch-externals",
      buildStart: function () {
        this.addWatchFile(`${sdPlugin}/manifest.json`);
      },
    },
    swc({
      minify: !isWatching,
      sourceMaps: isWatching,
      jsc: {
        parser: {
          decorators: true,
        },
      },
    }),
    json(),
    nodeResolve({
      browser: false,
      exportConditions: ["node"],
      preferBuiltins: true,
    }),
    commonjs(),
    {
      name: "emit-module-package-file",
      generateBundle() {
        this.emitFile({
          fileName: "package.json",
          source: JSON.stringify({
            main: "plugin.js",
          }),
          type: "asset",
        });
      },
    },
  ],
};

export default config;

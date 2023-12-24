import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import path from "node:path";
import url from "node:url";
import json from "@rollup/plugin-json";
import copy from "rollup-plugin-copy";
import { swc } from "rollup-plugin-swc3";
import replace from "@rollup/plugin-replace";

const isWatching = !!process.env.ROLLUP_WATCH;
const sdPlugin = "com.dim.streamdeck.sdPlugin";

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
    json(),
    isWatching &&
      replace({
        "process.env.CHECKPOINT_API": JSON.stringify(
          process.env.CHECKPOINT_API
        ),
        preventAssignment: true,
      }),
    copy({
      copyOnce: true,
      targets: [
        {
          src: "./node_modules/clipboardy/fallbacks/windows",
          dest: `${sdPlugin}/fallbacks/`,
        },
      ],
    }),
    {
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
          source: `{ "main": "plugin.js" }`,
          type: "asset",
        });
      },
    },
  ],
};

export default config;

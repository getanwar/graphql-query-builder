import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import eslint from "@rollup/plugin-eslint";

import pkg from "./package.json";

export default {
  input: "src/index.js",
  output: [
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" },
  ],
  plugins: [
    eslint({
      throwOnError: true,
    }),
    resolve(),
    // https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
    babel({ babelHelpers: "runtime" }),
  ],
  external: [/@babel\/runtime/],
};

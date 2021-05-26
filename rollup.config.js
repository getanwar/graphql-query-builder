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
    babel({ babelHelpers: "runtime" }),
  ],
  external: [/@babel\/runtime/],
};

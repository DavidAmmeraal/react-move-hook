import typescript from "@rollup/plugin-typescript";
import path from "path";

const baseDir = "./packages/react-move-hook";

const resolve = (dir) => path.resolve(baseDir, dir);

const typescriptPlugin = ({ ...overwrites } = {}) =>
  typescript({
    tsconfig: "./tsconfig.build.json",
    ...overwrites,
  });

export default [
  {
    input: [resolve("src/index.ts")],
    output: {
      dir: resolve("lib"),
      format: "cjs",
      exports: "auto",
      sourcemap: true,
    },
    external: ["react"],
    plugins: [
      typescriptPlugin({
        declarationDir: resolve("lib/types"),
        declaration: true,
      }),
    ],
  },
  {
    input: resolve("src/index.ts"),
    output: {
      file: resolve("lib/index.esm.js"),
      format: "es",
      exports: "auto",
      sourcemap: true,
    },
    external: ["react"],
    plugins: [typescriptPlugin({})],
  },
];

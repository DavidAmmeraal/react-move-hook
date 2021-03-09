import typescript from "@rollup/plugin-typescript";
import path from "path";

const baseDir = "./packages/react-move-hook";

const resolve = (dir) => path.resolve(baseDir, dir);

const typescriptPlugin = () =>
  typescript({ exclude: [resolve("src/stories/*"), resolve("/src/tests/*")] });

export default [
  {
    input: [resolve("src/index.ts"), resolve("src/connector.ts")],
    output: {
      dir: resolve("lib"),
      format: "cjs",
      exports: "auto",
    },
    external: ["react"],
    plugins: [typescriptPlugin()],
  },
  {
    input: resolve("src/index.esm.ts"),
    output: {
      file: resolve("lib/index.esm.js"),
      format: "es",
      exports: "auto",
    },
    external: ["react"],
    plugins: [typescriptPlugin()],
  },
];

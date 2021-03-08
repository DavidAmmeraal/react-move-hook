import typescript from "@rollup/plugin-typescript";

const typescriptPlugin = () =>
  typescript({ exclude: ["./src/stories/*", "./src/tests/*"] });

export default [
  {
    input: ["src/index.ts", "src/connector.ts"],
    output: {
      dir: "lib",
      format: "cjs",
      exports: "auto",
    },
    external: ["react"],
    plugins: [typescriptPlugin()],
  },
  {
    input: "src/index.esm.ts",
    output: {
      file: "lib/index.esm.js",
      format: "es",
      exports: "auto",
    },
    external: ["react"],
    plugins: [typescriptPlugin()],
  },
];

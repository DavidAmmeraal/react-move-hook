module.exports = {
  extends: ["airbnb-typescript", "plugin:prettier/recommended"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["react", "jest", "@typescript-eslint", "prettier", "react-hooks"],
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        "react/prop-types": "off",
        "react/jsx-props-no-spreading": "off",
      },
    },
  ],
};

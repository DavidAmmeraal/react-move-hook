module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
  ],
  settings: {
    react: {
      version: "17",
    },
  },
  env: {
    browser: true,
    jest: true,
    es6: true,
    node: true,
  },
  rules: {
    "react/prop-types": 0,
    "react/react-in-jsx-scope": 0,
    "prettier/prettier": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
  },
};

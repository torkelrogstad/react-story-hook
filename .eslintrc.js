const globals = require("confusing-browser-globals");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "no-restricted-globals": ["error"].concat(globals),
  },
  overrides: [
    {
      files: ["*.stories.tsx"],
      rules: {
        "react/display-name": "off",
        // linter rule thinks we're outside react components when writing stories
        "react-hooks/rules-of-hooks": "off",
        "@typescript-eslint/promise-function-async": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
};

/** @type {import("eslint").Linter.Config} */
const config = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "rules": {
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        "prefer": "type-imports",
        "fixStyle": "inline-type-imports"
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": {
          "attributes": false
        }
      }
    ],
    "import/extensions": ["error", "never"],
    "import/prefer-default-export": "off",
    "react/jsx-props-no-spreading": "off",
    "react/prop-types": "off",
    "react/require-default-props": "off",
    "react/react-in-jsx-scope": "off",
    "react/function-component-definition": "off",
    "react/jsx-no-undef": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "@typescript-eslint/indent": "off",
    "implicit-arrow-linebreak": "off",
    "react/jsx-curly-newline": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "operator-linebreak": "off",
    "react/jsx-one-expression-per-line": "off",
    "object-curly-newline": "off",
    "jsx-a11y/control-has-associated-label": "off",
    "react/jsx-pascal-case": "off",
    "no-extraneous-dependencies": "off",
    "react-hooks/rules-of-hooks": "off"
  }
}
module.exports = config;
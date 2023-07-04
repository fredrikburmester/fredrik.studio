module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  ignorePatterns: [".nuxt/*", ".output/*"],
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:prettier/recommended"],
  plugins: [],
  rules: {
    quotes: ["error", "double", { avoidEscape: true }],
    "vue/multi-word-component-names": ["off"],
    "vue/no-v-html": ["off"],
  },
};

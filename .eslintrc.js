//https://eslint.org/docs/latest/use/configure/

module.exports = {
  extends: ["eslint:recommended"],

  //https://eslint.org/docs/latest/use/configure/language-options#specifying-environments
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ["templates", "node_modules", "test", "example"],
};

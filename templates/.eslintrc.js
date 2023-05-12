//https://eslint.org/docs/latest/use/configure/

module.exports = {
  extends: ["eslint:recommended"],

  //如果需要支持react语法打开
  // extends: ["eslint:recommended", "plugin:react/recommended"],
  // "plugins": [
  //   "react"
  // ],
  
  //https://eslint.org/docs/latest/use/configure/language-options#specifying-environments
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  //https://eslint.org/docs/latest/use/configure/language-options#specifying-globals
  globals: {},

  //https://eslint.org/docs/latest/use/configure/language-options#specifying-parser-options
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      //如果要支持jsx，打开jsx：true
      // jsx: true,
    },
  },
};

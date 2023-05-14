const { default: babel_template } = require("@babel/template");
const { default: generate } = require("@babel/generator");
const path = require("path");
const extractModuleExports = require("../utils/extractModuleExports");
const t = require("@babel/types");

module.exports = async function (options) {
  const { template } = options;

  let { ast, target } = await extractModuleExports(
    path.resolve(__dirname, "../templates/.eslintrc.js")
  );

  const findChildField = (node, key) => {
    return node.properties.find(
      (item) => item.type == "ObjectProperty" && item.key.name == key
    );
  };

  if (template == "react") {
    findChildField(target, "extends").value.elements.push(
      babel_template.expression.ast(`"plugin:react/recommended"`)
    );
    findChildField(target, "plugins").value.elements.push(
      babel_template.expression.ast(`"react"`)
    );

    findChildField(
      findChildField(target, "parserOptions").value,
      "ecmaFeatures"
    ).value.properties.push(
      t.objectProperty(t.identifier("jsx"), t.booleanLiteral(true))
    );
  }

  // if (need_typescript) {

  // }

  return generate(ast).code;
};

const path = require("path");
const parseModuleExports = require("../utils/extractModuleExports");
const { default: generate } = require("@babel/generator");

module.exports = async function (options) {
  const {
    userOptions: { style_processor, need_typescript },
    logUtils,
  } = options;

  logUtils.log("开始生成webpack.config.js内容...");

  const baseFilePath = path.resolve(
    __dirname,
    "../templates/webpack/base.config.js"
  );

  const { ast, target } = await parseModuleExports(baseFilePath);

  const getRulesArr = (func) => {
    //return {}
    let retNode = func.body.body.find((item) => item.type == "ReturnStatement");

    const moduleNode = retNode.argument.properties.find(
      (item) => item.type == "ObjectProperty" && item.key.name == "module"
    );

    //find rules:[]
    let rulesNode = moduleNode.value.properties.find(
      (item) => item.type == "ObjectProperty" && item.key.name == "rules"
    );

    return rulesNode.value.elements;
  };

  let arr = getRulesArr(target);

  let filePaths = [
    style_processor == "less" && "less.rule.js",
    style_processor == "sass" && "sass.rule.js",
    need_typescript && "ts.rule.js",
  ]
    .filter(Boolean)
    .map((name) => path.resolve(__dirname, `../templates/webpack/${name}`));

  for (let filePath of filePaths) {
    const { target } = await parseModuleExports(filePath);
    arr.push(target);
  }

  return generate(ast).code;
};

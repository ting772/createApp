const path = require("path");
const parseModuleExports = require("../utils/extractModuleExports");
const { default: generate } = require("@babel/generator");
const { default: template } = require("@babel/template");

module.exports = async function (options) {
  const {
    userOptions: { style_processor, need_typescript, need_eslint },
    logUtils,
  } = options;

  logUtils.log("开始生成webpack.config.js内容...");

  const baseFilePath = path.resolve(
    __dirname,
    "../templates/webpack/base.config.js"
  );

  const { ast, target } = await parseModuleExports(baseFilePath);

  //return {}
  let retNode = target.body.body.find((item) => item.type == "ReturnStatement");

  //find module:{}
  function findModuleField(field) {
    return retNode.argument.properties.find(
      (item) => item.type == "ObjectProperty" && item.key.name == field
    );
  }
  const moduleNode = findModuleField("module");

  //find rules:[]
  let rulesNode = moduleNode.value.properties.find(
    (item) => item.type == "ObjectProperty" && item.key.name == "rules"
  );

  let rules = rulesNode.value.elements;

  if (style_processor == "less") {
    rules.push(
      template.expression.ast(`
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      }
      `)
    );
  } else if (style_processor == "sass") {
    rules.push(
      template.expression.ast(`
      {
        test: /\.s(a|c)ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      }
      `)
    );
  }
  if (need_typescript) {
    rules.push(
      template.expression.ast(`
      {
        test: /\.ts|tsx$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      }
      `)
    );
  }
  if (need_eslint) {
    const pluginNode = findModuleField("plugins");
    await require("../utils/addRequire")(
      ast,
      template.ast(`
        const ESLintPlugin = require('eslint-webpack-plugin');
    `)
    );
    pluginNode.value.elements.push(
      template.expression.ast(`
        (new ESLintPlugin({failOnError:true}))
      `)
    );
  }

  return generate(ast).code;
};

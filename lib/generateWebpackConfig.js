const path = require("path");
const parseModuleExports = require("../utils/extractModuleExports");
const { default: generate } = require("@babel/generator");
const { default: template } = require("@babel/template");

module.exports = async function (options) {
  const {
    userOptions: { style_processor, need_typescript, need_eslint, need_babel },
  } = options;

  const baseFilePath = path.resolve(
    __dirname,
    "../templates/webpack.config.js"
  );

  const { ast, target } = await parseModuleExports(baseFilePath);

  //return {}
  let retNode = target.body.body.find((item) => item.type == "ReturnStatement");

  //find module:{}
  function getTopLevelField(field) {
    return retNode.argument.properties.find(
      (item) => item.type == "ObjectProperty" && item.key.name == field
    );
  }
  const moduleNode = getTopLevelField("module");

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

  //babel内置支持typescript解析
  if (need_babel) {
    rules.push(
      template.expression.ast(`
        {
          test: /\\.m?js$/,
          exclude: /(node_modules)/,
          use:{
            loader: 'babel-loader',
            options:{
              cacheDirectory:true
            }
          }
        }
      `)
    );
  } else if (need_typescript) {
    rules.push(
      template.expression.ast(`
      {
        test: /\\.ts|tsx$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      }
      `)
    );
  }

  if (need_typescript) {
    //调整entry
    const entryNode = getTopLevelField("entry");
    entryNode.value.value = "./src/main.ts";
  }

  if (need_eslint) {
    const pluginNode = getTopLevelField("plugins");
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

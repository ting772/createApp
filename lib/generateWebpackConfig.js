const path = require("path");
const parseModuleExports = require("../utils/extractModuleExports");
const { default: generate } = require("@babel/generator");
const { default: babel_template } = require("@babel/template");

module.exports = async function (options) {
  const {
    style_processor,
    need_typescript,
    need_eslint,
    need_babel,
    template,
  } = options;

  const { ast, target } = await parseModuleExports(
    path.resolve(__dirname, "../templates/webpack.config.js")
  );

  //return {}
  let retNode = target.body.body.find((item) => item.type == "ReturnStatement");

  function getTopLevelField(field) {
    return retNode.argument.properties.find(
      (item) => item.type == "ObjectProperty" && item.key.name == field
    );
  }

  //find module:{}
  const moduleNode = getTopLevelField("module");

  const isReact = template == "react";
  const isVue = template.includes("vue");

  //find rules:[]
  let rulesNode = moduleNode.value.properties.find(
    (item) => item.type == "ObjectProperty" && item.key.name == "rules"
  );

  let rules = rulesNode.value.elements;

  if (style_processor == "less") {
    rules.push(
      babel_template.expression.ast(`
      {
        test: /\\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      }
      `)
    );
  } else if (style_processor == "sass") {
    rules.push(
      babel_template.expression.ast(`
      {
        test: /\\.s(a|c)ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      }
      `)
    );
  }

  if (isVue) {
    rules.push(
      babel_template.expression.ast(`
      {
        test: /\\.vue$/,
        loader: 'vue-loader'
      }
    `)
    );
  }

  //babel内置支持typescript解析
  if (need_babel) {
    let match = ["m?js"];
    if (isReact) match.push("jsx");
    if (need_typescript) match.push("ts");
    if (isReact && need_typescript) match.push("tsx");

    rules.push(
      babel_template.expression.ast(`
        {
          test: /\\.(${match.join("|")})$/,
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
      babel_template.expression.ast(`
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
    entryNode.value.value = isReact ? "./src/main.tsx" : "./src/main.ts";
  }

  const pluginNode = getTopLevelField("plugins");
  if (need_eslint) {
    await require("../utils/addRequire")(
      ast,
      babel_template.ast(`
        const ESLintPlugin = require('eslint-webpack-plugin');
    `)
    );
    pluginNode.value.elements.push(
      babel_template.expression.ast(`
        new ESLintPlugin({failOnError:true})
      `)
    );
  }

  if (isVue) {
    await require("../utils/addRequire")(
      ast,
      babel_template.ast(`
      const { VueLoaderPlugin } = require('vue-loader');
    `)
    );
    pluginNode.value.elements.push(
      babel_template.expression.ast(`
        new VueLoaderPlugin()
      `)
    );
  }

  return generate(ast).code;
};

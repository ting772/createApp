const webpack_installs = [
  "webpack",
  "webpack-cli",
  "html-webpack-plugin",
  "webpack-dev-server",
];

const style_installs = ["style-loader", "css-loader"];
const babel_installs = [];
const ts_installs = [];
const eslint_installs = [];

module.exports = function (options) {
  const {
    // is_electron,
    template,
    style_processor,
    need_typescript,
    need_babel,
    need_eslint,
  } = options;

  switch (style_processor) {
    case "less": {
      style_installs.push("less-loader", "less");
      break;
    }

    case "sass": {
      style_installs.push("sass-loader", "sass");
      break;
    }

    default:
      break;
  }

  const isReact = template == "react";

  //https://blog.csdn.net/iamxuqianqian/article/details/116067093
  if (need_babel) {
    babel_installs.push(
      "@babel/core",
      "@babel/cli",
      "@babel/preset-env",
      "babel-loader"
    );
    if (need_typescript) {
      babel_installs.push("@babel/preset-typescript");
    }
    if (isReact) {
      babel_installs.push("@babel/preset-react");
    }
  } else if (need_typescript) {
    ts_installs.push("typescript", "ts-loader");
  }
  if (need_eslint) {
    eslint_installs.push("eslint", "eslint-webpack-plugin");
    if (isReact) {
      //添加eslint对react语法支持
      eslint_installs.push("eslint-plugin-react");
    }
  }

  if (need_typescript && isReact) {
    ts_installs.push("@types/react", "@types/react-dom");
  }

  return webpack_installs.concat(
    style_installs,
    babel_installs,
    ts_installs,
    eslint_installs
  );
};

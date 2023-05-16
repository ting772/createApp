const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = function (env) {
  const { prod, production } = env;
  const isEnvProduction = prod || production;
  const devConfig = {};
  if (!isEnvProduction) {
    Object.assign(devConfig, {
      devServer: {
        compress: true,
        port: 9000,
        // devMiddleware: {
        //   writeToDisk: true,
        // },
        open: true,
        historyApiFallback: true,
      },
    });
  }
  return {
    mode: isEnvProduction ? "production" : "development",
    entry: "./src/main.js",
    output: {
      //https://www.webpackjs.com/configuration/output/#outputfilename
      filename: isEnvProduction ? "[name].[contenthash].js" : "[name].js",
      path: path.resolve(__dirname, "dist/"),
      clean: true,
    },
    devtool: isEnvProduction ? "hidden-source-map" : "eval",
    resolve: {
      //别名
      alias: { "@": path.resolve(__dirname, "src") },
      extensions: [".tsx", ".jsx", ".ts", ".js"],
    },
    ...devConfig,
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
      }),
    ],
  };
};

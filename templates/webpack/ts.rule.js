module.exports = {
  test: /\.ts|tsx$/,
  loader: "ts-loader",
  exclude: /node_modules/,
  options: {
    transpileOnly: true,
  },
};

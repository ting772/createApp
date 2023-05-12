module.exports = function (options) {
  const { template, need_typescript, need_babel } = options;

  const ret = [];
  if (need_babel) {
    ret.push("@babel/polyfill");
  }

  return ret;
};

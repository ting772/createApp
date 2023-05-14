module.exports = function (options) {
  const { template, need_router, need_babel, state_manage } = options;

  const ret = [];
  if (need_babel) {
    ret.push("@babel/polyfill");
  }
  if (template == "react") {
    ret.push("react", "react-dom", "immer");
    if (need_router) {
      ret.push("react-router-dom@6");
    }
  }
  if (state_manage == "mobx") {
    ret.push("mobx");
    if (template == "react") {
      ret.push("mobx-react-lite");
    }
  }
  return ret;
};

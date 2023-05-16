const {
  VUE3_STATE_MANAGE_VUEX,
  VUE3_STATE_MANAGE_PINIA,
} = require("../configs/commons");

module.exports = function (options) {
  const {
    template,
    need_babel,
    react_need_router,
    react_state_manage,
    vue2_need_vuex,
    vue2_need_router,

    vue3_need_router,
    vue3_state_manage,
  } = options;

  const ret = [];
  if (need_babel) {
    ret.push("@babel/polyfill");
  }

  switch (template) {
    case "react": {
      ret.push("react", "react-dom", "immer");
      if (react_need_router) {
        ret.push("react-router-dom@6");
      }

      if (react_state_manage == "mobx") {
        ret.push("mobx");
        ret.push("mobx-react-lite");
      }
      break;
    }

    case "vue2": {
      ret.push("vue@2");
      if (vue2_need_router) {
        ret.push("vue-router@3");
      }
      if (vue2_need_vuex) {
        ret.push("vuex@3");
      }
      break;
    }

    case "vue3": {
      ret.push("vue@3");
      if (vue3_need_router) ret.push("vue-router@4");
      if (vue3_state_manage == VUE3_STATE_MANAGE_VUEX) {
        ret.push("vuex@4");
      } else if (vue3_state_manage == VUE3_STATE_MANAGE_PINIA) {
        ret.push("pinia");
      }
      break;
    }

    default:
      break;
  }

  return ret;
};

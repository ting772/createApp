const { default: generate } = require("@babel/generator");
const { parse } = require("@babel/parser");
const {
  VUE3_STATE_MANAGE_VUEX,
  VUE3_STATE_MANAGE_PINIA,
} = require("../configs/commons");

module.exports = function (options) {
  const {
    template,
    vue2_need_vuex,
    vue2_need_router,
    vue3_need_router,
    vue3_state_manage,
  } = options;

  let ast;
  const parseOpts = {
    sourceType: "module",
    plugins: ["jsx"],
  };

  if (template == "vue2") {
    ast = parse(
      `
    import Vue from 'vue';
    ${vue2_need_router ? "import router from './router'" : ""}
    ${vue2_need_vuex ? "import store from './store'" : ""}
    import App from './App.vue'

    new Vue({
      ${vue2_need_vuex ? "store," : ""}
      ${vue2_need_router ? "router," : ""}
      render:(h)=>h(App)
    }).$mount("#app")
  `,
      parseOpts
    );
  } else if (template == "vue3") {
    const isVueX = vue3_state_manage == VUE3_STATE_MANAGE_VUEX;
    const isPinia = vue3_state_manage == VUE3_STATE_MANAGE_PINIA;
    ast = parse(
      `
    import { createApp } from 'vue'
    import App from './App.vue'
    ${vue3_need_router ? "import router from './router'" : ""}
    ${isVueX ? "import store from './store'" : ""}
    ${isPinia ? "import { createPinia } from 'pinia'" : ""}
    ${isPinia ? "const pinia = createPinia()" : ""}

    const app=createApp(App)
    ${vue3_need_router ? "app.use(router)" : ""}
    ${isVueX ? "app.use(store)" : ""}
    ${isPinia ? "app.use(pinia)" : ""}
    app.mount("#app")
    `,
      parseOpts
    );
  } else {
    throw Error("暂时不支持vue2/3以外的main.js生成");
  }

  return generate(ast).code;
};

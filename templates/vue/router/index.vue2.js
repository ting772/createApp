import Vue from "vue";
import VueRouter from "vue-router";
import HelloComponent from "@/components/Hello.vue";
Vue.use(VueRouter);

//https://v3.router.vuejs.org/zh/guide/#javascript

const routes = [{ path: "/", component: HelloComponent }];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;

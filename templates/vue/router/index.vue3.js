import { createWebHistory, createRouter } from "vue-router";
import HelloComponent from "@/components/Hello.vue";

//https://v3.router.vuejs.org/zh/guide/#javascript

const routes = [{ path: "/", component: HelloComponent }];

const router = new createRouter({
  routes,
  history: createWebHistory(),
});

export default router;

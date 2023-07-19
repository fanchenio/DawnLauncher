import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Index",
    component: () => import("@/views/index/Index.vue"),
  },
  {
    path: "/classification/addEdit",
    name: "ClassificationAddEdit",
    component: () => import("@/views/classification/AddEdit.vue"),
  },
  {
    path: "/item/addEdit",
    name: "ItemAddEdit",
    component: () => import("@/views/item/AddEdit.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/about/Index.vue"),
  },
  {
    path: "/setting",
    name: "Setting",
    component: () => import("@/views/setting/Index.vue"),
  },
  {
    path: "/searchWindow",
    name: "searchWindow",
    component: () => import("@/views/search/Window.vue"),
  },
];

export default new createRouter({
  routes,
  history: createWebHashHistory(),
});

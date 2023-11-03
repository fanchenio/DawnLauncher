import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteRecordRaw,
} from "vue-router";

let prod = import.meta.env.PROD;

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("../pages/index/Index.vue"),
  },
  {
    name: "SettingIndex",
    path: "/Setting/Index",
    component: () => import("../pages/setting/Index.vue"),
  },
  {
    name: "ClassificationAddEdit",
    path: "/Classification/AddEdit",
    component: () => import("../pages/classification/AddEdit.vue"),
  },
  {
    name: "ClassificationSetIcon",
    path: "/Classification/SetIcon",
    component: () => import("../pages/classification/SetIcon.vue"),
  },
  {
    name: "ClassificationAssociateFolder",
    path: "/Classification/AssociateFolder",
    component: () => import("../pages/classification/AssociateFolder.vue"),
  },
  {
    name: "ClassificationAggregate",
    path: "/Classification/Aggregate",
    component: () => import("../pages/classification/Aggregate.vue"),
  },
  {
    name: "ItemAddEdit",
    path: "/Item/AddEdit",
    component: () => import("../pages/item/AddEdit.vue"),
  },
  {
    name: "ItemNetworkIcon",
    path: "/Item/NetworkIcon",
    component: () => import("../pages/item/NetworkIcon.vue"),
  },
  {
    name: "ItemSVGIcon",
    path: "/Item/SVGIcon",
    component: () => import("../pages/item/SVGIcon.vue"),
  },
  {
    name: "QuickSearch",
    path: "/Search/QuickSearch",
    component: () => import("../pages/search/QuickSearch.vue"),
  },
  {
    name: "About",
    path: "/About",
    component: () => import("../pages/about/Index.vue"),
  },
  {
    name: "BackupRestoreData",
    path: "/Data/BackupRestore",
    component: () => import("../pages/data/BackupRestore.vue"),
  },
];

const router = createRouter({
  history: prod ? createWebHashHistory() : createWebHistory(),
  routes,
});

export default router;

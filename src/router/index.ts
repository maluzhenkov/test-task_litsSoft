import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "@/router/guards";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    onlyGuest?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: { name: "tasks" } },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: { onlyGuest: true },
    },
    {
      path: "/tasks",
      name: "tasks",
      component: () => import("@/views/TasksView.vue"),
      meta: { requiresAuth: true },
    },
    { path: "/:pathMatch(.*)*", redirect: { name: "tasks" } },
  ],
});

router.beforeEach(authGuard);

export default router;

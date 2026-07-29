import type { NavigationGuard } from "vue-router";
import { useAuthStore } from "@/stores/auth";

/**
 * Пускает на защищённые маршруты только с токеном, а авторизованного
 * не пускает на «гостевые». Вынесен из router/index.ts, чтобы тестировать
 * логику без создания роутера и history.
 */
export const authGuard: NavigationGuard = (to) => {
  const authStore = useAuthStore();

  if (to.meta.onlyGuest && authStore.isAuthenticated) {
    return { name: "tasks" };
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  return true;
};

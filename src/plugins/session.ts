import type { Pinia } from "pinia";
import type { Router } from "vue-router";
import { useNotifications } from "@/composables/useNotifications";
import { useAuthStore } from "@/stores/auth";
import { useTasksStore } from "@/stores/tasks";

interface SessionExpiryDeps {
  pinia: Pinia;
  router: Router;
}

/**
 * Токен json-server-auth живёт ограниченное время: вместо «зависшего» UI
 * разлогиниваем, показываем уведомление и уводим на логин. Сторы берём лениво —
 * на момент сборки API-клиента provide ещё не выполнен.
 */
export const createSessionExpiryHandler =
  ({ pinia, router }: SessionExpiryDeps) =>
  () => {
    const authStore = useAuthStore(pinia);
    if (!authStore.isAuthenticated) return;

    authStore.logout();
    useTasksStore(pinia).reset();
    useNotifications().notifyError("Сессия истекла. Войдите снова.");
    void router.push({ name: "login" });
  };

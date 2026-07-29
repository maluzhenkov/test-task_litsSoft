import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { setUnauthorizedHandler } from "@/api";
import { useNotifications } from "@/composables/useNotifications";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useTasksStore } from "@/stores/tasks";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const authStore = useAuthStore(pinia);
const tasksStore = useTasksStore(pinia);
const { notifyError } = useNotifications();

// Токен json-server-auth живёт ограниченное время: вместо «зависшего» UI
// показываем уведомление и уводим на логин.
setUnauthorizedHandler(() => {
  if (!authStore.isAuthenticated) return;

  authStore.logout();
  tasksStore.reset();
  notifyError("Сессия истекла. Войдите снова.");
  void router.push({ name: "login" });
});

app.mount("#app");

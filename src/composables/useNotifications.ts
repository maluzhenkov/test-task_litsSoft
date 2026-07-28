import { readonly, ref } from "vue";
import type { AppNotification, NotificationType } from "@/types";

const DEFAULT_TIMEOUT = 5000;

const items = ref<AppNotification[]>([]);
let lastId = 0;

const dismiss = (id: number) => {
  items.value = items.value.filter((item) => item.id !== id);
};

const notify = (type: NotificationType, message: string) => {
  const id = ++lastId;
  items.value.push({ id, type, message });
  setTimeout(() => dismiss(id), DEFAULT_TIMEOUT);
};

/** Общий для приложения стек всплывающих уведомлений. */
export const useNotifications = () => ({
  notifications: readonly(items),
  notifySuccess: (message: string) => notify("success", message),
  notifyError: (message: string) => notify("error", message),
  dismiss,
});

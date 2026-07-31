import type { App } from "vue";
import { useNotifications } from "@/composables/useNotifications";
import { getErrorMessage, isUnauthorizedError } from "@/utils/errors";

/**
 * Последний рубеж: ошибки, которые не поймали ни стор, ни ErrorBoundary,
 * не должны молча ломать интерфейс. Здесь же место для отправки в Sentry.
 */
export const registerErrorHandler = (app: App) => {
  const { notifyError } = useNotifications();

  const report = (error: unknown, source: string) => {
    console.error(`[${source}]`, error);

    // 401 уже обработан интерсептором: разлогин и своё уведомление.
    if (isUnauthorizedError(error)) return;

    notifyError(getErrorMessage(error));
  };

  app.config.errorHandler = (error, _instance, info) =>
    report(error, `vue:${info}`);

  window.addEventListener("unhandledrejection", (event) =>
    report(event.reason, "unhandledrejection"),
  );
};

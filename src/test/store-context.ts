import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { apiClientKey, type ApiClient } from "@/api";
import { createApiClientMock, type ApiClientMock } from "@/test/factories";

/**
 * Сторы получают API через inject, а Pinia выполняет их setup в контексте
 * приложения — поэтому тестам нужен app с provide, а не только createPinia().
 */
export const setupStoreContext = (
  api: ApiClientMock = createApiClientMock(),
) => {
  const app = createApp({});
  const pinia = createPinia();

  app.use(pinia);
  app.provide(apiClientKey, api as unknown as ApiClient);
  setActivePinia(pinia);

  return { api, pinia };
};

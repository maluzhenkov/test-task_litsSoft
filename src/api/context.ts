import { inject, type InjectionKey } from "vue";
import type { ApiClient } from "@/api/client";

export const apiClientKey: InjectionKey<ApiClient> = Symbol("api-client");

/**
 * Клиент приходит через app.provide из main.ts. Сторы и компоненты не знают,
 * как он собран, поэтому в тестах на его место подставляется заглушка.
 * Внутри setup-стора inject работает: Pinia выполняет setup в контексте приложения.
 */
export const useApiClient = (): ApiClient => {
  const client = inject(apiClientKey);

  if (!client) {
    throw new Error(
      "API-клиент не предоставлен: вызовите app.provide(apiClientKey, createApiClient(...))",
    );
  }

  return client;
};

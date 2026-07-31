import type { Pinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Router } from "vue-router";
import { createSessionExpiryHandler } from "@/plugins/session";
import { useAuthStore } from "@/stores/auth";
import { useTasksStore } from "@/stores/tasks";
import { createTask } from "@/test/factories";
import { setupStoreContext } from "@/test/store-context";
import { readToken, saveSession } from "@/utils/auth-storage";

const { notifyError } = vi.hoisted(() => ({ notifyError: vi.fn() }));

vi.mock("@/composables/useNotifications", () => ({
  useNotifications: () => ({ notifyError }),
}));

describe("createSessionExpiryHandler", () => {
  let pinia: Pinia;
  let router: Router;

  beforeEach(() => {
    ({ pinia } = setupStoreContext());
    router = { push: vi.fn() } as unknown as Router;
    notifyError.mockClear();
  });

  it("разлогинивает, чистит задачи, уведомляет и уводит на логин", () => {
    saveSession("jwt-token", "test@test.com");
    const tasksStore = useTasksStore(pinia);
    tasksStore.items = [createTask({ id: 1 })];

    createSessionExpiryHandler({ pinia, router })();

    expect(useAuthStore(pinia).isAuthenticated).toBe(false);
    expect(readToken()).toBeNull();
    expect(tasksStore.items).toHaveLength(0);
    expect(notifyError).toHaveBeenCalledWith("Сессия истекла. Войдите снова.");
    expect(router.push).toHaveBeenCalledWith({ name: "login" });
  });

  it("молчит, если пользователь и так не авторизован", () => {
    createSessionExpiryHandler({ pinia, router })();

    expect(notifyError).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });
});

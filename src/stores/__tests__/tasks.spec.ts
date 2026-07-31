import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTasksStore } from "@/stores/tasks";
import {
  createAxiosError,
  createAxiosResponse,
  createTask,
  type ApiClientMock,
} from "@/test/factories";
import { setupStoreContext } from "@/test/store-context";
import type { Task } from "@/types";

const { notifySuccess, notifyError } = vi.hoisted(() => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

vi.mock("@/composables/useNotifications", () => ({
  useNotifications: () => ({ notifySuccess, notifyError }),
}));

const payload = {
  title: "Написать тесты",
  description: "Покрыть сторы",
  status: "todo",
  priority: "high",
} as const;

describe("tasks store", () => {
  let api: ApiClientMock;

  beforeEach(() => {
    ({ api } = setupStoreContext());
    notifySuccess.mockClear();
    notifyError.mockClear();
  });

  describe("fetchTasks", () => {
    it("загружает список и снимает флаг загрузки", async () => {
      const tasks = [createTask({ id: 1 }), createTask({ id: 2 })];
      api.tasks.getAll.mockResolvedValue(createAxiosResponse(tasks));

      const store = useTasksStore();
      await store.fetchTasks();

      expect(store.items).toHaveLength(2);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it("сохраняет сообщение об ошибке для показа с кнопкой «Повторить»", async () => {
      api.tasks.getAll.mockRejectedValue(
        createAxiosError({ code: "ERR_NETWORK" }),
      );

      const store = useTasksStore();
      await store.fetchTasks();

      expect(store.error).toBe(
        "Сервер недоступен. Проверьте, что mock-api запущен.",
      );
      expect(store.isLoading).toBe(false);
    });

    it("молчит на 401: разлогином занимается интерсептор", async () => {
      api.tasks.getAll.mockRejectedValue(
        createAxiosError({ status: 401, data: "jwt expired" }),
      );

      const store = useTasksStore();
      await store.fetchTasks();

      expect(store.error).toBeNull();
    });
  });

  describe("visibleTasks", () => {
    const seed = (store: ReturnType<typeof useTasksStore>) => {
      store.items = [
        createTask({
          id: 1,
          title: "Настроить окружение",
          status: "todo",
          createdAt: "2026-07-01T10:00:00.000Z",
        }),
        createTask({
          id: 2,
          title: "Сверстать страницу логина",
          status: "done",
          createdAt: "2026-07-03T10:00:00.000Z",
        }),
        createTask({
          id: 3,
          title: "Настроить Pinia store",
          status: "todo",
          createdAt: "2026-07-02T10:00:00.000Z",
        }),
      ];
    };

    it("отдаёт все задачи от новых к старым", () => {
      const store = useTasksStore();
      seed(store);

      expect(store.visibleTasks.map((task) => task.id)).toEqual([2, 3, 1]);
    });

    it("фильтрует по статусу", () => {
      const store = useTasksStore();
      seed(store);
      store.setStatusFilter("done");

      expect(store.visibleTasks.map((task) => task.id)).toEqual([2]);
    });

    it("ищет по названию без учёта регистра и пробелов по краям", () => {
      const store = useTasksStore();
      seed(store);
      store.setSearch("  НАСТРОИТЬ  ");

      expect(store.visibleTasks.map((task) => task.id)).toEqual([3, 1]);
    });

    it("сочетает поиск и фильтр", () => {
      const store = useTasksStore();
      seed(store);
      store.setSearch("настроить");
      store.setStatusFilter("done");

      expect(store.visibleTasks).toHaveLength(0);
    });

    it("сообщает, применены ли фильтры", () => {
      const store = useTasksStore();
      seed(store);

      expect(store.isFiltered).toBe(false);

      store.setSearch("   ");
      expect(store.isFiltered).toBe(false);

      store.setSearch("логин");
      expect(store.isFiltered).toBe(true);

      store.resetFilters();
      expect(store.isFiltered).toBe(false);
      expect(store.filters).toEqual({ status: "all", search: "" });
    });
  });

  describe("createTask", () => {
    it("добавляет задачу и уведомляет об успехе", async () => {
      const created = createTask({ id: 10, ...payload });
      api.tasks.create.mockResolvedValue(createAxiosResponse(created));

      const store = useTasksStore();

      await expect(store.createTask(payload)).resolves.toBe(true);

      expect(store.items).toEqual([created]);
      expect(store.isSubmitting).toBe(false);
      expect(notifySuccess).toHaveBeenCalledWith("Задача создана");
    });

    it("при ошибке возвращает false, не меняет список и показывает уведомление", async () => {
      api.tasks.create.mockRejectedValue(
        createAxiosError({
          status: 500,
          data: { message: "Внутренняя ошибка" },
        }),
      );

      const store = useTasksStore();

      await expect(store.createTask(payload)).resolves.toBe(false);

      expect(store.items).toHaveLength(0);
      expect(notifyError).toHaveBeenCalledWith("Внутренняя ошибка");
    });

    it("не дублирует уведомление на 401", async () => {
      api.tasks.create.mockRejectedValue(
        createAxiosError({ status: 401, data: "jwt expired" }),
      );

      const store = useTasksStore();
      await store.createTask(payload);

      expect(notifyError).not.toHaveBeenCalled();
    });
  });

  describe("updateTask", () => {
    it("заменяет задачу в списке", async () => {
      const updated = createTask({ id: 2, title: "Новое название" });
      api.tasks.update.mockResolvedValue(createAxiosResponse(updated));

      const store = useTasksStore();
      store.items = [createTask({ id: 1 }), createTask({ id: 2 })];

      await expect(
        store.updateTask(2, { title: "Новое название" }),
      ).resolves.toBe(true);

      expect(store.items[1]).toEqual(updated);
      expect(store.items[0].id).toBe(1);
      expect(notifySuccess).toHaveBeenCalledWith("Задача обновлена");
    });
  });

  describe("changeStatus", () => {
    it("держит id в pendingIds на время запроса и обновляет задачу", async () => {
      let resolveStatus!: (response: AxiosResponse<Task>) => void;

      api.tasks.updateStatus.mockReturnValue(
        new Promise<AxiosResponse<Task>>((resolve) => {
          resolveStatus = resolve;
        }),
      );

      const store = useTasksStore();
      store.items = [createTask({ id: 1, status: "todo" })];

      const pending = store.changeStatus(1, "done");
      expect(store.pendingIds.has(1)).toBe(true);

      resolveStatus(createAxiosResponse(createTask({ id: 1, status: "done" })));
      await pending;

      expect(store.pendingIds.has(1)).toBe(false);
      expect(store.items[0].status).toBe("done");
    });

    it("оставляет прежний статус при ошибке", async () => {
      api.tasks.updateStatus.mockRejectedValue(
        createAxiosError({ status: 500, data: "Server error" }),
      );

      const store = useTasksStore();
      store.items = [createTask({ id: 1, status: "todo" })];

      await expect(store.changeStatus(1, "done")).resolves.toBe(false);

      expect(store.items[0].status).toBe("todo");
      expect(store.pendingIds.has(1)).toBe(false);
      expect(notifyError).toHaveBeenCalledWith("Server error");
    });
  });

  describe("deleteTask", () => {
    it("убирает задачу из списка", async () => {
      api.tasks.remove.mockResolvedValue(createAxiosResponse(undefined));

      const store = useTasksStore();
      store.items = [createTask({ id: 1 }), createTask({ id: 2 })];

      await expect(store.deleteTask(1)).resolves.toBe(true);

      expect(store.items.map((task) => task.id)).toEqual([2]);
      expect(notifySuccess).toHaveBeenCalledWith("Задача удалена");
    });

    it("при ошибке оставляет задачу на месте", async () => {
      api.tasks.remove.mockRejectedValue(
        createAxiosError({ status: 500, data: "Server error" }),
      );

      const store = useTasksStore();
      store.items = [createTask({ id: 1 })];

      await expect(store.deleteTask(1)).resolves.toBe(false);

      expect(store.items).toHaveLength(1);
    });
  });

  it("reset возвращает стор к исходному состоянию", async () => {
    api.tasks.getAll.mockRejectedValue(
      createAxiosError({ code: "ERR_NETWORK" }),
    );

    const store = useTasksStore();
    store.items = [createTask({ id: 1 })];
    store.setSearch("логин");
    store.setStatusFilter("done");
    await store.fetchTasks();

    store.reset();

    expect(store.items).toHaveLength(0);
    expect(store.error).toBeNull();
    expect(store.filters).toEqual({ status: "all", search: "" });
  });
});

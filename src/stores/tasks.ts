import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useApiClient } from "@/api";
import { useNotifications } from "@/composables/useNotifications";
import type {
  StatusFilter,
  Task,
  TaskCreatePayload,
  TaskFilters,
  TaskStatus,
  TaskUpdatePayload,
} from "@/types";
import { getErrorMessage, isUnauthorizedError } from "@/utils/errors";

export const useTasksStore = defineStore("tasks", () => {
  const api = useApiClient();
  const { notifySuccess, notifyError } = useNotifications();

  const items = ref<Task[]>([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);
  const pendingIds = ref(new Set<Task["id"]>());
  const filters = ref<TaskFilters>({ status: "all", search: "" });

  const isFiltered = computed(
    () => filters.value.status !== "all" || filters.value.search.trim() !== "",
  );

  const visibleTasks = computed(() => {
    const search = filters.value.search.trim().toLowerCase();
    const { status } = filters.value;

    return items.value
      .filter((task) => status === "all" || task.status === status)
      .filter((task) => !search || task.title.toLowerCase().includes(search))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  // 401 обрабатывается интерсептором: там логаут и редирект, дублировать не нужно.
  const reportError = (requestError: unknown) => {
    if (!isUnauthorizedError(requestError)) {
      notifyError(getErrorMessage(requestError));
    }
  };

  const withPending = async <T>(id: Task["id"], action: () => Promise<T>) => {
    pendingIds.value.add(id);

    try {
      return await action();
    } finally {
      pendingIds.value.delete(id);
    }
  };

  const replaceTask = (task: Task) => {
    items.value = items.value.map((item) =>
      item.id === task.id ? task : item,
    );
  };

  const setStatusFilter = (status: StatusFilter) => {
    filters.value.status = status;
  };

  const setSearch = (search: string) => {
    filters.value.search = search;
  };

  const resetFilters = () => {
    filters.value = { status: "all", search: "" };
  };

  const fetchTasks = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.tasks.getAll();
      items.value = data;
    } catch (requestError) {
      if (!isUnauthorizedError(requestError)) {
        error.value = getErrorMessage(requestError);
      }
    } finally {
      isLoading.value = false;
    }
  };

  const createTask = async (payload: TaskCreatePayload): Promise<boolean> => {
    isSubmitting.value = true;

    try {
      const { data } = await api.tasks.create(payload);
      items.value.push(data);
      notifySuccess("Задача создана");

      return true;
    } catch (requestError) {
      reportError(requestError);

      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  const updateTask = async (
    id: Task["id"],
    payload: TaskUpdatePayload,
  ): Promise<boolean> => {
    isSubmitting.value = true;

    try {
      const { data } = await api.tasks.update(id, payload);
      replaceTask(data);
      notifySuccess("Задача обновлена");

      return true;
    } catch (requestError) {
      reportError(requestError);

      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  const changeStatus = async (id: Task["id"], status: TaskStatus) =>
    withPending(id, async () => {
      try {
        const { data } = await api.tasks.updateStatus(id, status);
        replaceTask(data);

        return true;
      } catch (requestError) {
        reportError(requestError);

        return false;
      }
    });

  const deleteTask = async (id: Task["id"]) =>
    withPending(id, async () => {
      try {
        await api.tasks.remove(id);
        items.value = items.value.filter((item) => item.id !== id);
        notifySuccess("Задача удалена");

        return true;
      } catch (requestError) {
        reportError(requestError);

        return false;
      }
    });

  const reset = () => {
    items.value = [];
    error.value = null;
    filters.value = { status: "all", search: "" };
  };

  return {
    items,
    isLoading,
    isSubmitting,
    error,
    pendingIds,
    filters,
    isFiltered,
    visibleTasks,
    setStatusFilter,
    setSearch,
    resetFilters,
    fetchTasks,
    createTask,
    updateTask,
    changeStatus,
    deleteTask,
    reset,
  };
});

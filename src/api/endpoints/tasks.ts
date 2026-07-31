import type { AxiosInstance } from "axios";
import type {
  Task,
  TaskCreatePayload,
  TaskListParams,
  TaskStatus,
  TaskUpdatePayload,
} from "@/types";

export const createTasksApi = (http: AxiosInstance) => ({
  getAll: (params?: TaskListParams) => http.get<Task[]>("/tasks", { params }),

  getById: (id: Task["id"]) => http.get<Task>(`/tasks/${id}`),

  create: (payload: TaskCreatePayload) =>
    http.post<Task>("/tasks", {
      ...payload,
      createdAt: new Date().toISOString(),
    }),

  update: (id: Task["id"], payload: TaskUpdatePayload) =>
    http.patch<Task>(`/tasks/${id}`, payload),

  updateStatus: (id: Task["id"], status: TaskStatus) =>
    http.patch<Task>(`/tasks/${id}`, { status }),

  remove: (id: Task["id"]) => http.delete<void>(`/tasks/${id}`),
});

export type TasksApi = ReturnType<typeof createTasksApi>;

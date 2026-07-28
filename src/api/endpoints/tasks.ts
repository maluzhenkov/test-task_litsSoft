import request from "@/api/instance";
import type {
  Task,
  TaskListParams,
  TaskCreatePayload,
  TaskUpdatePayload,
  TaskStatus,
} from "@/types";

export const getAll = (params?: TaskListParams) =>
  request.get<Task[]>("/tasks", { params })

export const getById = (id: Task["id"]) => request.get<Task>(`/tasks/${id}`)

export const create = (payload: TaskCreatePayload) =>
  request.post<Task>("/tasks", {
    ...payload,
    createdAt: new Date().toISOString(),
  })

export const update = (id: Task["id"], payload: TaskUpdatePayload) =>
  request.patch<Task>(`/tasks/${id}`, payload)

export const updateStatus = (id: Task["id"], status: TaskStatus) =>
  request.patch<Task>(`/tasks/${id}`, { status })

export const remove = (id: Task["id"]) => request.delete<void>(`/tasks/${id}`)
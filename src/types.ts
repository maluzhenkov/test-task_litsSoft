export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

export type TaskCreatePayload = Omit<Task, "id" | "createdAt">;
export type TaskUpdatePayload = Partial<TaskCreatePayload>;

export interface TaskListParams {
  status?: TaskStatus;
}

export type StatusFilter = TaskStatus | "all";

export interface TaskFilters {
  status: StatusFilter;
  search: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export type NotificationType = "success" | "error";

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
}

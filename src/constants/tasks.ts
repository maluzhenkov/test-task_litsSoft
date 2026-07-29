import type { StatusFilter, TaskPriority, TaskStatus } from "@/types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "К выполнению",
  "in-progress": "В работе",
  done: "Готово",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
};

export const PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
  low: "bg-sky-100 text-sky-800",
  medium: "bg-indigo-100 text-indigo-800",
  high: "bg-rose-100 text-rose-800",
};

export const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as TaskStatus[]).map(
  (value) => ({ value, label: STATUS_LABELS[value] }),
);

export const PRIORITY_OPTIONS = (
  Object.keys(PRIORITY_LABELS) as TaskPriority[]
).map((value) => ({ value, label: PRIORITY_LABELS[value] }));

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Все статусы" },
  ...STATUS_OPTIONS,
];

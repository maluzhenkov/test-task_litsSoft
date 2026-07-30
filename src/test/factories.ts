import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { Task } from "@/types";

export const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: "Настроить окружение",
  description: "Установить зависимости проекта",
  status: "todo",
  priority: "medium",
  createdAt: "2026-07-01T10:00:00.000Z",
  ...overrides,
});

export const createAxiosResponse = <T>(data: T): AxiosResponse<T> =>
  ({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  }) as AxiosResponse<T>;

interface AxiosErrorOptions {
  status?: number;
  data?: unknown;
  code?: string;
  url?: string;
  message?: string;
}

export const createAxiosError = ({
  status,
  data,
  code,
  url,
  message = "Request failed",
}: AxiosErrorOptions = {}): AxiosError => {
  const config = { url, headers: {} } as InternalAxiosRequestConfig;

  const response =
    status === undefined
      ? undefined
      : ({
          status,
          data,
          statusText: "",
          headers: {},
          config,
        } as AxiosResponse);

  return new AxiosError(message, code, config, undefined, response);
};

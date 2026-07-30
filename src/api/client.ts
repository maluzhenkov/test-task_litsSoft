import axios, { isAxiosError, type AxiosInstance } from "axios";
import { createAuthApi, type AuthApi } from "@/api/endpoints/auth";
import { createTasksApi, type TasksApi } from "@/api/endpoints/tasks";

/** На этих маршрутах 401 означает неверные креденшелы, а не протухшую сессию. */
const AUTH_ENDPOINTS = ["/login", "/register"];

export interface ApiClientOptions {
  baseURL: string;
  /** Читается на каждый запрос, поэтому клиент не хранит копию токена. */
  getToken: () => string | null;
  /** Реакция на протухшую сессию: разлогин и редирект остаются в main.ts. */
  onUnauthorized?: () => void;
}

export interface ApiClient {
  /** Низкоуровневый инстанс для нестандартных запросов и подмены адаптера в тестах. */
  http: AxiosInstance;
  auth: AuthApi;
  tasks: TasksApi;
}

const isSessionExpired = (error: unknown): boolean =>
  isAxiosError(error) &&
  error.response?.status === 401 &&
  !AUTH_ENDPOINTS.some((endpoint) => error.config?.url?.startsWith(endpoint));

/**
 * Зависимости приходят аргументами, а не мутацией модуля: каждый вызов даёт
 * изолированный клиент, поэтому тесты не делят состояние между собой.
 */
export const createApiClient = ({
  baseURL,
  getToken,
  onUnauthorized,
}: ApiClientOptions): ApiClient => {
  const http = axios.create({ baseURL });

  http.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  });

  http.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isSessionExpired(error)) onUnauthorized?.();

      return Promise.reject(error);
    },
  );

  return { http, auth: createAuthApi(http), tasks: createTasksApi(http) };
};

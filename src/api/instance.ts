import axios, { isAxiosError } from "axios";
import { readToken } from "@/utils/auth-storage";

const AUTH_ENDPOINTS = ["/login", "/register"];

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

let unauthorizedHandler: (() => void) | null = null;

/**
 * Обработчик 401 регистрируется в main.ts: так интерсептор не импортирует
 * store и router напрямую и не создаёт циклических зависимостей.
 */
export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

instance.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const isAuthRequest =
      isAxiosError(error) &&
      AUTH_ENDPOINTS.some((endpoint) =>
        error.config?.url?.startsWith(endpoint),
      );

    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      !isAuthRequest
    ) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);

export default instance;

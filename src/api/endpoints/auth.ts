import type { AxiosInstance } from "axios";
import type { AuthResponse, Credentials } from "@/types";

export const createAuthApi = (http: AxiosInstance) => ({
  login: (credentials: Credentials) =>
    http.post<AuthResponse>("/login", credentials),

  register: (credentials: Credentials) =>
    http.post<AuthResponse>("/register", credentials),
});

export type AuthApi = ReturnType<typeof createAuthApi>;

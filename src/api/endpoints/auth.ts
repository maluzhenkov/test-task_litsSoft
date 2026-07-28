import request from "@/api/instance";
import type { Credentials, AuthResponse } from "@/types";

export const login = (credentials: Credentials) =>
  request.post<AuthResponse>("/login", credentials)

export const register = (credentials: Credentials) =>
  request.post<AuthResponse>("/register", credentials)
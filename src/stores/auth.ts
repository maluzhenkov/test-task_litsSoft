import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { authApi } from "@/api";
import type { Credentials } from "@/types";
import {
  clearSession,
  readEmail,
  readToken,
  saveSession,
} from "@/utils/auth-storage";
import { getErrorMessage } from "@/utils/errors";

export const useAuthStore = defineStore("auth", () => {
  // Токен и email читаются из localStorage, поэтому сессия переживает F5.
  const token = ref<string | null>(readToken());
  const email = ref<string | null>(readEmail());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(token.value));

  const login = async (credentials: Credentials): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await authApi.login(credentials);

      token.value = data.accessToken;
      email.value = data.user.email;
      saveSession(data.accessToken, data.user.email);

      return true;
    } catch (requestError) {
      error.value = getErrorMessage(requestError);

      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    email.value = null;
    error.value = null;
    clearSession();
  };

  return { token, email, isLoading, error, isAuthenticated, login, logout };
});

import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/stores/auth";
import {
  createAxiosError,
  createAxiosResponse,
  type ApiClientMock,
} from "@/test/factories";
import { setupStoreContext } from "@/test/store-context";
import type { AuthResponse } from "@/types";
import { readEmail, readToken, saveSession } from "@/utils/auth-storage";

const credentials = { email: "test@test.com", password: "12345678" };

const authResponse = (overrides: Partial<AuthResponse> = {}): AuthResponse => ({
  accessToken: "jwt-token",
  user: { id: 1, email: "test@test.com" },
  ...overrides,
});

describe("auth store", () => {
  let api: ApiClientMock;

  beforeEach(() => {
    ({ api } = setupStoreContext());
  });

  it("по умолчанию не авторизован", () => {
    const store = useAuthStore();

    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.email).toBeNull();
  });

  it("поднимает сессию из localStorage, поэтому переживает перезагрузку", () => {
    saveSession("saved-token", "saved@test.com");

    const store = useAuthStore();

    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe("saved-token");
    expect(store.email).toBe("saved@test.com");
  });

  it("сохраняет токен и email после успешного входа", async () => {
    api.auth.login.mockResolvedValue(createAxiosResponse(authResponse()));

    const store = useAuthStore();

    await expect(store.login(credentials)).resolves.toBe(true);

    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe("jwt-token");
    expect(store.email).toBe("test@test.com");
    expect(store.error).toBeNull();
    expect(readToken()).toBe("jwt-token");
    expect(readEmail()).toBe("test@test.com");
  });

  it("берёт email из ответа сервера, а не из формы", async () => {
    api.auth.login.mockResolvedValue(
      createAxiosResponse(
        authResponse({ user: { id: 7, email: "canonical@test.com" } }),
      ),
    );

    const store = useAuthStore();
    await store.login({ ...credentials, email: "  TEST@test.com" });

    expect(store.email).toBe("canonical@test.com");
    expect(readEmail()).toBe("canonical@test.com");
  });

  it("показывает понятную ошибку и не пускает внутрь при неверном пароле", async () => {
    api.auth.login.mockRejectedValue(
      createAxiosError({ status: 400, data: "Incorrect password" }),
    );

    const store = useAuthStore();

    await expect(store.login(credentials)).resolves.toBe(false);

    expect(store.error).toBe("Неверный пароль");
    expect(store.isAuthenticated).toBe(false);
    expect(readToken()).toBeNull();
  });

  it("сбрасывает прошлую ошибку при новой попытке входа", async () => {
    api.auth.login.mockRejectedValueOnce(
      createAxiosError({ status: 400, data: "Cannot find user" }),
    );

    const store = useAuthStore();
    await store.login(credentials);

    expect(store.error).toBe("Пользователь с таким email не найден");

    api.auth.login.mockResolvedValueOnce(createAxiosResponse(authResponse()));
    await store.login(credentials);

    expect(store.error).toBeNull();
  });

  it("держит isLoading только на время запроса", async () => {
    let resolveLogin!: (response: AxiosResponse<AuthResponse>) => void;

    api.auth.login.mockReturnValue(
      new Promise<AxiosResponse<AuthResponse>>((resolve) => {
        resolveLogin = resolve;
      }),
    );

    const store = useAuthStore();
    const pending = store.login(credentials);

    expect(store.isLoading).toBe(true);

    resolveLogin(createAxiosResponse(authResponse()));
    await pending;

    expect(store.isLoading).toBe(false);
  });

  it("чистит состояние и localStorage при выходе", async () => {
    api.auth.login.mockResolvedValue(createAxiosResponse(authResponse()));

    const store = useAuthStore();
    await store.login(credentials);

    store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.email).toBeNull();
    expect(readToken()).toBeNull();
    expect(readEmail()).toBeNull();
  });
});

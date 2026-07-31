import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";
import { createApiClient, type ApiClient } from "@/api";
import { createAxiosError } from "@/test/factories";

const setup = (token: string | null = null) => {
  const onUnauthorized = vi.fn();

  const client = createApiClient({
    baseURL: "http://api.test",
    getToken: () => token,
    onUnauthorized,
  });

  return { client, onUnauthorized };
};

/** Сеть не мокаем: подменяем адаптер, поэтому цепочка интерсепторов работает целиком. */
const stubSuccess = (client: ApiClient) => {
  const requests: InternalAxiosRequestConfig[] = [];

  client.http.defaults.adapter = async (config) => {
    requests.push(config);

    return {
      data: [],
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    } as AxiosResponse;
  };

  return requests;
};

const stubFailure = (client: ApiClient, status: number, url: string) => {
  client.http.defaults.adapter = async () => {
    throw createAxiosError({ status, url, data: "Ошибка" });
  };
};

describe("createApiClient", () => {
  describe("подстановка токена", () => {
    it("добавляет заголовок Authorization, когда токен есть", async () => {
      const { client } = setup("jwt-token");
      const requests = stubSuccess(client);

      await client.tasks.getAll();

      expect(requests[0].headers.Authorization).toBe("Bearer jwt-token");
    });

    it("не добавляет заголовок без токена", async () => {
      const { client } = setup();
      const requests = stubSuccess(client);

      await client.tasks.getAll();

      expect(requests[0].headers.Authorization).toBeUndefined();
    });
  });

  describe("обработка 401", () => {
    it("вызывает onUnauthorized на защищённом запросе", async () => {
      const { client, onUnauthorized } = setup("jwt-token");
      stubFailure(client, 401, "/tasks");

      await expect(client.tasks.getAll()).rejects.toThrow();

      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it("молчит на логине: это неверные креденшелы, а не протухшая сессия", async () => {
      const { client, onUnauthorized } = setup();
      stubFailure(client, 401, "/login");

      await expect(
        client.auth.login({ email: "a@b.c", password: "12345678" }),
      ).rejects.toThrow();

      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it("молчит на регистрации", async () => {
      const { client, onUnauthorized } = setup();
      stubFailure(client, 401, "/register");

      await expect(
        client.auth.register({ email: "a@b.c", password: "12345678" }),
      ).rejects.toThrow();

      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it("не реагирует на прочие статусы", async () => {
      const { client, onUnauthorized } = setup("jwt-token");
      stubFailure(client, 500, "/tasks");

      await expect(client.tasks.getAll()).rejects.toThrow();

      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it("не задевает обработчик соседнего клиента: состояние не общее", async () => {
      const first = setup("jwt-token");
      const second = setup("jwt-token");
      stubFailure(first.client, 401, "/tasks");

      await expect(first.client.tasks.getAll()).rejects.toThrow();

      expect(first.onUnauthorized).toHaveBeenCalledTimes(1);
      expect(second.onUnauthorized).not.toHaveBeenCalled();
    });
  });
});

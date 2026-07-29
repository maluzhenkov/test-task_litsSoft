import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import instance, { setUnauthorizedHandler } from "@/api/instance";
import { createAxiosError } from "@/test/factories";
import { saveSession } from "@/utils/auth-storage";

/** Сеть не мокаем: подменяем адаптер, поэтому цепочка интерсепторов работает целиком. */
const stubSuccess = () => {
  const requests: InternalAxiosRequestConfig[] = [];

  instance.defaults.adapter = async (config) => {
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

const stubFailure = (status: number, url: string) => {
  instance.defaults.adapter = async () => {
    throw createAxiosError({ status, url, data: "Ошибка" });
  };
};

describe("axios instance", () => {
  describe("подстановка токена", () => {
    it("добавляет заголовок Authorization, когда токен есть", async () => {
      const requests = stubSuccess();
      saveSession("jwt-token", "test@test.com");

      await instance.get("/tasks");

      expect(requests[0].headers.Authorization).toBe("Bearer jwt-token");
    });

    it("не добавляет заголовок без токена", async () => {
      const requests = stubSuccess();

      await instance.get("/tasks");

      expect(requests[0].headers.Authorization).toBeUndefined();
    });
  });

  describe("обработка 401", () => {
    const handler = vi.fn();

    beforeEach(() => {
      handler.mockClear();
      setUnauthorizedHandler(handler);
    });

    it("вызывает обработчик на защищённом запросе", async () => {
      stubFailure(401, "/tasks");

      await expect(instance.get("/tasks")).rejects.toThrow();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("не вызывает обработчик на запросе логина: это неверные креденшелы", async () => {
      stubFailure(401, "/login");

      await expect(instance.post("/login", {})).rejects.toThrow();

      expect(handler).not.toHaveBeenCalled();
    });

    it("не вызывает обработчик на регистрации", async () => {
      stubFailure(401, "/register");

      await expect(instance.post("/register", {})).rejects.toThrow();

      expect(handler).not.toHaveBeenCalled();
    });

    it("не реагирует на прочие статусы", async () => {
      stubFailure(500, "/tasks");

      await expect(instance.get("/tasks")).rejects.toThrow();

      expect(handler).not.toHaveBeenCalled();
    });
  });
});

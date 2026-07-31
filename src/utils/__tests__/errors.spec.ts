import { describe, expect, it } from "vitest";
import { createAxiosError } from "@/test/factories";
import { getErrorMessage, isUnauthorizedError } from "@/utils/errors";

const FALLBACK = "Что-то пошло не так. Попробуйте ещё раз.";

describe("getErrorMessage", () => {
  it("сообщает о недоступности сервера при сетевой ошибке", () => {
    const error = createAxiosError({ code: "ERR_NETWORK" });

    expect(getErrorMessage(error)).toBe(
      "Сервер недоступен. Проверьте, что mock-api запущен.",
    );
  });

  it("переводит известные сообщения json-server-auth", () => {
    const error = createAxiosError({ status: 400, data: "Incorrect password" });

    expect(getErrorMessage(error)).toBe("Неверный пароль");
  });

  it("отдаёт неизвестное строковое тело как есть, без пробелов по краям", () => {
    const error = createAxiosError({
      status: 400,
      data: "  Unexpected body  ",
    });

    expect(getErrorMessage(error)).toBe("Unexpected body");
  });

  it("читает поле message из тела-объекта", () => {
    const error = createAxiosError({
      status: 500,
      data: { message: "Внутренняя ошибка" },
    });

    expect(getErrorMessage(error)).toBe("Внутренняя ошибка");
  });

  it("использует message самой ошибки, когда тело пустое", () => {
    const error = createAxiosError({
      status: 500,
      data: "",
      message: "Request failed with status code 500",
    });

    expect(getErrorMessage(error)).toBe("Request failed with status code 500");
  });

  it("возвращает message обычной ошибки", () => {
    expect(getErrorMessage(new Error("Что-то сломалось"))).toBe(
      "Что-то сломалось",
    );
  });

  it("падает в фолбэк на неизвестных значениях", () => {
    expect(getErrorMessage("просто строка")).toBe(FALLBACK);
    expect(getErrorMessage(null)).toBe(FALLBACK);
    expect(getErrorMessage(new Error())).toBe(FALLBACK);
  });
});

describe("isUnauthorizedError", () => {
  it("распознаёт 401", () => {
    expect(isUnauthorizedError(createAxiosError({ status: 401 }))).toBe(true);
  });

  it("не реагирует на остальные статусы", () => {
    expect(isUnauthorizedError(createAxiosError({ status: 403 }))).toBe(false);
    expect(isUnauthorizedError(createAxiosError({ code: "ERR_NETWORK" }))).toBe(
      false,
    );
  });

  it("не реагирует на ошибки не от axios", () => {
    expect(isUnauthorizedError(new Error("401"))).toBe(false);
  });
});

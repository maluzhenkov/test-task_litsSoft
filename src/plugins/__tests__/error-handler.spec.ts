import { createApp } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerErrorHandler } from "@/plugins/error-handler";
import { createAxiosError } from "@/test/factories";

const { notifyError } = vi.hoisted(() => ({ notifyError: vi.fn() }));

vi.mock("@/composables/useNotifications", () => ({
  useNotifications: () => ({ notifyError }),
}));

type RejectionListener = (event: { reason: unknown }) => void;

const setup = () => {
  const listeners = new Map<string, RejectionListener>();

  vi.stubGlobal("window", {
    addEventListener: (type: string, listener: RejectionListener) =>
      listeners.set(type, listener),
  });

  const app = createApp({});
  registerErrorHandler(app);

  return {
    fail: (error: unknown) => app.config.errorHandler?.(error, null, "render"),
    reject: (reason: unknown) =>
      listeners.get("unhandledrejection")?.({ reason }),
  };
};

describe("registerErrorHandler", () => {
  beforeEach(() => {
    notifyError.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("показывает уведомление об ошибке компонента", () => {
    setup().fail(new Error("Внезапный сбой"));

    expect(notifyError).toHaveBeenCalledWith("Внезапный сбой");
  });

  it("ловит необработанное отклонение промиса", () => {
    setup().reject(createAxiosError({ code: "ERR_NETWORK" }));

    expect(notifyError).toHaveBeenCalledWith(
      "Сервер недоступен. Проверьте, что mock-api запущен.",
    );
  });

  it("молчит на 401: разлогин и уведомление уже сделал интерсептор", () => {
    setup().fail(createAxiosError({ status: 401, data: "jwt expired" }));

    expect(notifyError).not.toHaveBeenCalled();
  });

  it("логирует ошибку с указанием источника", () => {
    const error = new Error("Внезапный сбой");
    setup().fail(error);

    expect(console.error).toHaveBeenCalledWith("[vue:render]", error);
  });
});

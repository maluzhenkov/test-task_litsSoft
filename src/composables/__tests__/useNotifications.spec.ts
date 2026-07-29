import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type NotificationsModule = typeof import("@/composables/useNotifications");

let useNotifications: NotificationsModule["useNotifications"];

describe("useNotifications", () => {
  // Стек уведомлений живёт в модуле, поэтому для изоляции тестов
  // переимпортируем модуль заново перед каждым.
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    ({ useNotifications } = await import("@/composables/useNotifications"));
  });

  afterEach(() => vi.useRealTimers());

  it("добавляет уведомление об успехе", () => {
    const { notifications, notifySuccess } = useNotifications();

    notifySuccess("Задача создана");

    expect(notifications.value).toHaveLength(1);
    expect(notifications.value[0]).toMatchObject({
      type: "success",
      message: "Задача создана",
    });
  });

  it("добавляет уведомление об ошибке", () => {
    const { notifications, notifyError } = useNotifications();

    notifyError("Сервер недоступен");

    expect(notifications.value[0]).toMatchObject({
      type: "error",
      message: "Сервер недоступен",
    });
  });

  it("сам убирает уведомление через пять секунд", () => {
    const { notifications, notifySuccess } = useNotifications();

    notifySuccess("Задача удалена");

    vi.advanceTimersByTime(4999);
    expect(notifications.value).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(notifications.value).toHaveLength(0);
  });

  it("закрывает уведомление по id, не трогая остальные", () => {
    const { notifications, notifyError, dismiss } = useNotifications();

    notifyError("Первая ошибка");
    notifyError("Вторая ошибка");

    dismiss(notifications.value[0].id);

    expect(notifications.value).toHaveLength(1);
    expect(notifications.value[0].message).toBe("Вторая ошибка");
  });

  it("выдаёт уникальные id", () => {
    const { notifications, notifySuccess } = useNotifications();

    notifySuccess("Раз");
    notifySuccess("Два");

    const [first, second] = notifications.value;

    expect(first.id).not.toBe(second.id);
  });
});

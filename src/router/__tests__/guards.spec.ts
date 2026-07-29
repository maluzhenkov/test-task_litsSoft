import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import type {
  NavigationGuardNext,
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
  RouteMeta,
} from "vue-router";
import { authGuard } from "@/router/guards";
import { saveSession } from "@/utils/auth-storage";

const from = {} as RouteLocationNormalizedLoadedGeneric;
const next = (() => {}) as unknown as NavigationGuardNext;

const target = (meta: RouteMeta, fullPath = "/tasks") =>
  ({ meta, fullPath }) as RouteLocationNormalizedGeneric;

const login = () => saveSession("jwt-token", "test@test.com");

describe("authGuard", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("уводит гостя с защищённого маршрута на логин и запоминает адрес", () => {
    const result = authGuard(target({ requiresAuth: true }), from, next);

    expect(result).toEqual({
      name: "login",
      query: { redirect: "/tasks" },
    });
  });

  it("пускает авторизованного на защищённый маршрут", () => {
    login();

    expect(authGuard(target({ requiresAuth: true }), from, next)).toBe(true);
  });

  it("уводит авторизованного с гостевого маршрута к задачам", () => {
    login();

    const result = authGuard(target({ onlyGuest: true }, "/login"), from, next);

    expect(result).toEqual({ name: "tasks" });
  });

  it("пускает гостя на страницу логина", () => {
    expect(authGuard(target({ onlyGuest: true }, "/login"), from, next)).toBe(
      true,
    );
  });

  it("не мешает маршрутам без флагов", () => {
    expect(authGuard(target({}, "/"), from, next)).toBe(true);

    login();
    expect(authGuard(target({}, "/"), from, next)).toBe(true);
  });
});

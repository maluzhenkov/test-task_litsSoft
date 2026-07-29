import { describe, expect, it } from "vitest";
import {
  clearSession,
  readEmail,
  readToken,
  saveSession,
} from "@/utils/auth-storage";

describe("auth-storage", () => {
  it("возвращает null, когда сессии нет", () => {
    expect(readToken()).toBeNull();
    expect(readEmail()).toBeNull();
  });

  it("сохраняет токен вместе с email", () => {
    saveSession("jwt-token", "test@test.com");

    expect(readToken()).toBe("jwt-token");
    expect(readEmail()).toBe("test@test.com");
  });

  it("чистит сессию целиком", () => {
    saveSession("jwt-token", "test@test.com");
    clearSession();

    expect(readToken()).toBeNull();
    expect(readEmail()).toBeNull();
  });
});

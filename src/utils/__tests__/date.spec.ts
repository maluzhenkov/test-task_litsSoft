import { describe, expect, it } from "vitest";
import { formatDate } from "@/utils/date";

describe("formatDate", () => {
  it("форматирует ISO-дату в человекочитаемый вид", () => {
    const formatted = formatDate("2026-07-01T10:00:00.000Z");

    expect(formatted).toContain("01");
    expect(formatted).toContain("2026");
  });

  it("возвращает тире для некорректного значения", () => {
    expect(formatDate("не дата")).toBe("—");
    expect(formatDate("")).toBe("—");
  });
});

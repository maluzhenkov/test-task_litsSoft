import { effectScope, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedSearch } from "@/composables/useDebouncedSearch";

/**
 * Композабл вешает onScopeDispose, поэтому запускаем его внутри scope:
 * иначе Vue предупредит о вызове вне активного scope, а таймер не снимется.
 */
const runInScope = <T extends object>(composable: () => T) => {
  const scope = effectScope();
  const result = scope.run(composable);

  if (!result) throw new Error("Композабл не выполнился");

  return { ...result, stop: () => scope.stop() };
};

describe("useDebouncedSearch", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("обновляет debouncedQuery только после задержки", async () => {
    const { query, debouncedQuery, stop } = runInScope(() =>
      useDebouncedSearch(),
    );

    query.value = "логин";
    await nextTick();

    expect(debouncedQuery.value).toBe("");

    vi.advanceTimersByTime(299);
    expect(debouncedQuery.value).toBe("");

    vi.advanceTimersByTime(1);
    expect(debouncedQuery.value).toBe("логин");

    stop();
  });

  it("схлопывает серию быстрых изменений в одно обновление", async () => {
    const { query, debouncedQuery, stop } = runInScope(() =>
      useDebouncedSearch(),
    );

    query.value = "л";
    await nextTick();
    vi.advanceTimersByTime(100);

    query.value = "ло";
    await nextTick();
    vi.advanceTimersByTime(100);

    query.value = "лог";
    await nextTick();

    // Промежуточные значения до конца задержки не доехали.
    expect(debouncedQuery.value).toBe("");

    vi.advanceTimersByTime(300);
    expect(debouncedQuery.value).toBe("лог");

    stop();
  });

  it("принимает начальное значение и свою задержку", async () => {
    const { query, debouncedQuery, stop } = runInScope(() =>
      useDebouncedSearch("готово", 500),
    );

    expect(query.value).toBe("готово");
    expect(debouncedQuery.value).toBe("готово");

    query.value = "новое";
    await nextTick();
    vi.advanceTimersByTime(300);

    expect(debouncedQuery.value).toBe("готово");

    vi.advanceTimersByTime(200);
    expect(debouncedQuery.value).toBe("новое");

    stop();
  });

  it("снимает отложенное обновление при остановке scope", async () => {
    const { query, debouncedQuery, stop } = runInScope(() =>
      useDebouncedSearch(),
    );

    query.value = "не долетит";
    await nextTick();
    stop();

    vi.advanceTimersByTime(1000);

    expect(debouncedQuery.value).toBe("");
  });
});

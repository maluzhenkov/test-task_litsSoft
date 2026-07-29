import { beforeEach, vi } from "vitest";

/**
 * Тесты идут в окружении node, где localStorage недоступен без флага,
 * поэтому подкладываем минимальную реализацию поверх Map.
 */
class MemoryStorage implements Storage {
  private items = new Map<string, string>();

  get length(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.items.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }

  setItem(key: string, value: string): void {
    this.items.set(key, String(value));
  }
}

const storage = new MemoryStorage();

vi.stubGlobal("localStorage", storage);

beforeEach(() => storage.clear());

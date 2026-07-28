import { onScopeDispose, ref, watch } from "vue";

const DEFAULT_DELAY = 300;

/**
 * `query` привязывается к полю ввода, `debouncedQuery` обновляется
 * с задержкой — на него можно вешать поиск без лишних срабатываний.
 */
export const useDebouncedSearch = (initial = "", delay = DEFAULT_DELAY) => {
  const query = ref(initial);
  const debouncedQuery = ref(initial);

  let timeout: ReturnType<typeof setTimeout> | undefined;

  watch(query, (value) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedQuery.value = value;
    }, delay);
  });

  onScopeDispose(() => clearTimeout(timeout));

  return { query, debouncedQuery };
};

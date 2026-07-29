<script setup lang="ts">
import { watch } from "vue";
import { useDebouncedSearch } from "@/composables/useDebouncedSearch";
import { STATUS_FILTER_OPTIONS } from "@/constants/tasks";
import type { StatusFilter } from "@/types";

const { status, search } = defineProps<{
  status: StatusFilter;
  search: string;
}>();

const emit = defineEmits<{
  "update:status": [status: StatusFilter];
  "update:search": [search: string];
}>();

const { query, debouncedQuery } = useDebouncedSearch(search);

watch(debouncedQuery, (value) => emit("update:search", value));

// Значение может измениться извне (например, сброс фильтров) — подхватываем.
watch(
  () => search,
  (value) => {
    if (value !== query.value) query.value = value;
  },
);

const handleStatusChange = (event: Event) => {
  const { value } = event.target as HTMLSelectElement;
  emit("update:status", value as StatusFilter);
};
</script>

<template>
  <div class="card flex flex-col gap-3 sm:flex-row sm:items-end">
    <div class="flex-1">
      <label class="field-label" for="task-search">Поиск по названию</label>
      <input
        id="task-search"
        v-model="query"
        class="field"
        type="search"
        placeholder="Например, логин"
      />
    </div>

    <div class="sm:w-48">
      <label class="field-label" for="task-status-filter">Статус</label>
      <select
        id="task-status-filter"
        class="field"
        :value="status"
        @change="handleStatusChange"
      >
        <option
          v-for="option in STATUS_FILTER_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

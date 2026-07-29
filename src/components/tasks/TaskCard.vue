<script setup lang="ts">
import {
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "@/constants/tasks";
import type { Task, TaskStatus } from "@/types";
import { formatDate } from "@/utils/date";

const { task, pending } = defineProps<{ task: Task; pending: boolean }>();

const emit = defineEmits<{
  edit: [task: Task];
  remove: [task: Task];
  "update-status": [status: TaskStatus];
}>();

const handleStatusChange = (event: Event) => {
  const { value } = event.target as HTMLSelectElement;
  emit("update-status", value as TaskStatus);
};
</script>

<template>
  <article class="card space-y-3" :class="{ 'opacity-60': pending }">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <h3 class="text-base font-semibold break-words">{{ task.title }}</h3>

      <div class="flex shrink-0 flex-wrap gap-1.5">
        <span class="badge" :class="STATUS_BADGE_CLASSES[task.status]">
          {{ STATUS_LABELS[task.status] }}
        </span>
        <span class="badge" :class="PRIORITY_BADGE_CLASSES[task.priority]">
          {{ PRIORITY_LABELS[task.priority] }}
        </span>
      </div>
    </div>

    <p v-if="task.description" class="text-sm break-words text-slate-600">
      {{ task.description }}
    </p>

    <p class="text-xs text-slate-400">
      Создана {{ formatDate(task.createdAt) }}
    </p>

    <div
      class="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3"
    >
      <label class="sr-only" :for="`task-status-${task.id}`">
        Статус задачи «{{ task.title }}»
      </label>
      <select
        :id="`task-status-${task.id}`"
        class="field w-auto py-1.5 text-xs"
        :value="task.status"
        :disabled="pending"
        @change="handleStatusChange"
      >
        <option
          v-for="option in STATUS_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <div class="ml-auto flex gap-2">
        <button
          type="button"
          class="btn btn-secondary px-3 py-1.5 text-xs"
          :disabled="pending"
          @click="emit('edit', task)"
        >
          Изменить
        </button>
        <button
          type="button"
          class="btn btn-ghost px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          :disabled="pending"
          @click="emit('remove', task)"
        >
          Удалить
        </button>
      </div>
    </div>
  </article>
</template>

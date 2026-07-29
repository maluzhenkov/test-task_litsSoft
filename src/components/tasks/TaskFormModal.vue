<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/constants/tasks";
import type {
  Task,
  TaskCreatePayload,
  TaskPriority,
  TaskStatus,
} from "@/types";

const { task = null, submitting } = defineProps<{
  task?: Task | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: TaskCreatePayload];
  close: [];
}>();

const title = ref(task?.title ?? "");
const description = ref(task?.description ?? "");
const status = ref<TaskStatus>(task?.status ?? "todo");
const priority = ref<TaskPriority>(task?.priority ?? "medium");
const isTouched = ref(false);

const titleInput = useTemplateRef<HTMLInputElement>("titleInput");

const titleError = computed(() =>
  isTouched.value && !title.value.trim() ? "Введите название" : null,
);

onMounted(() => titleInput.value?.focus());

const handleSubmit = () => {
  isTouched.value = true;
  if (titleError.value) return;

  emit("submit", {
    title: title.value.trim(),
    description: description.value.trim(),
    status: status.value,
    priority: priority.value,
  });
};
</script>

<template>
  <BaseModal
    :title="task ? 'Редактировать задачу' : 'Новая задача'"
    @close="emit('close')"
  >
    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <div>
        <label class="field-label" for="task-title">Название</label>
        <input
          id="task-title"
          ref="titleInput"
          v-model="title"
          class="field"
          type="text"
          :aria-invalid="Boolean(titleError)"
          :disabled="submitting"
        />
        <p v-if="titleError" class="field-error">{{ titleError }}</p>
      </div>

      <div>
        <label class="field-label" for="task-description">Описание</label>
        <textarea
          id="task-description"
          v-model="description"
          class="field resize-y"
          rows="3"
          :disabled="submitting"
        ></textarea>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="field-label" for="task-status">Статус</label>
          <select
            id="task-status"
            v-model="status"
            class="field"
            :disabled="submitting"
          >
            <option
              v-for="option in STATUS_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="field-label" for="task-priority">Приоритет</label>
          <select
            id="task-priority"
            v-model="priority"
            class="field"
            :disabled="submitting"
          >
            <option
              v-for="option in PRIORITY_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="submitting"
          @click="emit('close')"
        >
          Отмена
        </button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? "Сохраняем…" : "Сохранить" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

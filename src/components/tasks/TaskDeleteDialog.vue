<script setup lang="ts">
import BaseModal from "@/components/ui/BaseModal.vue";
import type { Task } from "@/types";

const { task, pending } = defineProps<{ task: Task; pending: boolean }>();

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();
</script>

<template>
  <BaseModal title="Удалить задачу?" @close="emit('close')">
    <p class="text-sm text-slate-600">
      Задача «{{ task.title }}» будет удалена безвозвратно.
    </p>

    <div class="mt-5 flex justify-end gap-2">
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="pending"
        @click="emit('close')"
      >
        Отмена
      </button>
      <button
        type="button"
        class="btn btn-danger"
        :disabled="pending"
        @click="emit('confirm')"
      >
        {{ pending ? "Удаляем…" : "Удалить" }}
      </button>
    </div>
  </BaseModal>
</template>

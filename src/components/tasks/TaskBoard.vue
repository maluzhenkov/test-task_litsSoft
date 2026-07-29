<script setup lang="ts">
import { onMounted, ref } from "vue";
import TaskDeleteDialog from "@/components/tasks/TaskDeleteDialog.vue";
import TaskFilters from "@/components/tasks/TaskFilters.vue";
import TaskFormModal from "@/components/tasks/TaskFormModal.vue";
import TaskList from "@/components/tasks/TaskList.vue";
import TaskListSkeleton from "@/components/tasks/TaskListSkeleton.vue";
import { useTasksStore } from "@/stores/tasks";
import type { Task, TaskCreatePayload } from "@/types";

const tasksStore = useTasksStore();

const isFormOpen = ref(false);
const editingTask = ref<Task | null>(null);
const deletingTask = ref<Task | null>(null);

onMounted(() => tasksStore.fetchTasks());

const openCreateForm = () => {
  editingTask.value = null;
  isFormOpen.value = true;
};

const openEditForm = (task: Task) => {
  editingTask.value = task;
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  editingTask.value = null;
};

const handleSubmit = async (payload: TaskCreatePayload) => {
  const target = editingTask.value;

  const isSaved = target
    ? await tasksStore.updateTask(target.id, payload)
    : await tasksStore.createTask(payload);

  if (isSaved) closeForm();
};

const handleDelete = async () => {
  const target = deletingTask.value;
  if (!target) return;

  if (await tasksStore.deleteTask(target.id)) deletingTask.value = null;
};
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Мои задачи</h1>

      <button type="button" class="btn btn-primary" @click="openCreateForm">
        Новая задача
      </button>
    </div>

    <TaskFilters
      :status="tasksStore.filters.status"
      :search="tasksStore.filters.search"
      @update:status="tasksStore.setStatusFilter"
      @update:search="tasksStore.setSearch"
    />

    <TaskListSkeleton v-if="tasksStore.isLoading" />

    <div
      v-else-if="tasksStore.error"
      class="card space-y-3 text-center"
      role="alert"
    >
      <p class="text-sm text-rose-700">{{ tasksStore.error }}</p>
      <button
        type="button"
        class="btn btn-secondary"
        @click="tasksStore.fetchTasks()"
      >
        Повторить
      </button>
    </div>

    <div
      v-else-if="!tasksStore.items.length"
      class="card space-y-3 text-center"
    >
      <p class="text-sm text-slate-500">Задач пока нет — создайте первую.</p>
      <button type="button" class="btn btn-primary" @click="openCreateForm">
        Новая задача
      </button>
    </div>

    <div
      v-else-if="!tasksStore.visibleTasks.length"
      class="card space-y-3 text-center"
    >
      <p class="text-sm text-slate-500">
        По выбранным условиям задач не найдено.
      </p>
      <button
        type="button"
        class="btn btn-secondary"
        @click="tasksStore.resetFilters()"
      >
        Сбросить фильтры
      </button>
    </div>

    <TaskList
      v-else
      :tasks="tasksStore.visibleTasks"
      :pending-ids="tasksStore.pendingIds"
      @edit="openEditForm"
      @remove="deletingTask = $event"
      @update-status="tasksStore.changeStatus"
    />

    <TaskFormModal
      v-if="isFormOpen"
      :key="editingTask?.id ?? 'new'"
      :task="editingTask"
      :submitting="tasksStore.isSubmitting"
      @submit="handleSubmit"
      @close="closeForm"
    />

    <TaskDeleteDialog
      v-if="deletingTask"
      :task="deletingTask"
      :pending="tasksStore.pendingIds.has(deletingTask.id)"
      @confirm="handleDelete"
      @close="deletingTask = null"
    />
  </section>
</template>

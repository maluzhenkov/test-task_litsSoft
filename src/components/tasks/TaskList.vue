<script setup lang="ts">
import TaskCard from "@/components/tasks/TaskCard.vue";
import type { Task, TaskStatus } from "@/types";

const { tasks, pendingIds } = defineProps<{
  tasks: Task[];
  pendingIds: Set<Task["id"]>;
}>();

const emit = defineEmits<{
  edit: [task: Task];
  remove: [task: Task];
  "update-status": [id: Task["id"], status: TaskStatus];
}>();
</script>

<template>
  <ul class="space-y-3">
    <li v-for="task in tasks" :key="task.id">
      <TaskCard
        :task="task"
        :pending="pendingIds.has(task.id)"
        @edit="emit('edit', task)"
        @remove="emit('remove', task)"
        @update-status="emit('update-status', task.id, $event)"
      />
    </li>
  </ul>
</template>

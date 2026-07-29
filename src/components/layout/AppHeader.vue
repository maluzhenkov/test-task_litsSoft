<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTasksStore } from "@/stores/tasks";

const router = useRouter();
const authStore = useAuthStore();
const tasksStore = useTasksStore();

const handleLogout = async () => {
  authStore.logout();
  tasksStore.reset();
  await router.push({ name: "login" });
};
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div
      class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3"
    >
      <p class="text-base font-semibold">Трекер задач</p>

      <div class="flex items-center gap-3">
        <span
          v-if="authStore.email"
          class="hidden text-sm text-slate-500 sm:inline"
        >
          {{ authStore.email }}
        </span>

        <button type="button" class="btn btn-secondary" @click="handleLogout">
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>

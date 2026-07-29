<script setup lang="ts">
const { count = 3 } = defineProps<{ count?: number }>();
</script>

<template>
  <div class="space-y-3" aria-busy="true" aria-label="Загрузка задач">
    <div
      v-for="index in count"
      :key="index"
      class="card animate-pulse space-y-3"
    >
      <div class="flex justify-between gap-2">
        <div class="h-4 w-2/5 rounded bg-slate-200"></div>
        <div class="h-4 w-24 rounded bg-slate-200"></div>
      </div>
      <div class="h-3 w-4/5 rounded bg-slate-100"></div>
      <div class="h-3 w-1/4 rounded bg-slate-100"></div>
      <div class="h-8 w-full rounded bg-slate-100"></div>
    </div>
  </div>
</template>

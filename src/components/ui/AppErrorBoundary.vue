<script setup lang="ts">
import { onErrorCaptured, ref, watch } from "vue";
import { getErrorMessage } from "@/utils/errors";

/** Смена значения (обычно — маршрута) снимает запасной экран. */
const { resetKey } = defineProps<{ resetKey?: string | number }>();

const error = ref<string | null>(null);

// Возвращаем false: ошибка дальше не всплывает, поэтому глобальный
// errorHandler не покажет второе сообщение о том же сбое.
onErrorCaptured((caught) => {
  console.error("[error-boundary]", caught);
  error.value = getErrorMessage(caught);

  return false;
});

watch(
  () => resetKey,
  () => {
    error.value = null;
  },
);

const reload = () => window.location.reload();
</script>

<template>
  <main v-if="error" class="mx-auto max-w-md px-4 py-6">
    <div class="card space-y-3 text-center" role="alert">
      <h1 class="text-base font-semibold">Что-то пошло не так</h1>
      <p class="text-sm text-slate-500">{{ error }}</p>

      <button type="button" class="btn btn-primary" @click="reload">
        Перезагрузить страницу
      </button>
    </div>
  </main>

  <slot v-else />
</template>

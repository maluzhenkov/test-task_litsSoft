<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const { title } = defineProps<{ title: string }>();

const emit = defineEmits<{ close: [] }>();

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") emit("close");
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.documentElement.classList.add("overflow-hidden");
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.documentElement.classList.remove("overflow-hidden");
});
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="mb-4 flex items-start justify-between gap-4">
          <h2 class="text-lg font-semibold">{{ title }}</h2>

          <button
            type="button"
            class="btn btn-ghost -mt-1 -mr-1 px-2 py-1 text-xl leading-none"
            aria-label="Закрыть"
            @click="emit('close')"
          >
            &times;
          </button>
        </header>

        <slot />
      </div>
    </div>
  </Teleport>
</template>

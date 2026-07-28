<script setup lang="ts">
import { useNotifications } from "@/composables/useNotifications";

const { notifications, dismiss } = useNotifications();
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      class="pointer-events-none fixed inset-x-4 top-4 z-60 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4"
      enter-from-class="translate-y-2 opacity-0"
      leave-to-class="translate-y-2 opacity-0"
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
      move-class="transition duration-200"
    >
      <output
        v-for="notification in notifications"
        :key="notification.id"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm shadow-lg"
        :class="
          notification.type === 'error'
            ? 'bg-rose-600 text-white'
            : 'bg-emerald-600 text-white'
        "
      >
        <span class="flex-1">{{ notification.message }}</span>

        <button
          type="button"
          class="cursor-pointer opacity-80 transition hover:opacity-100"
          aria-label="Закрыть уведомление"
          @click="dismiss(notification.id)"
        >
          &times;
        </button>
      </output>
    </TransitionGroup>
  </Teleport>
</template>

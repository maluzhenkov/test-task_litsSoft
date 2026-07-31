<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppErrorBoundary from "@/components/ui/AppErrorBoundary.vue";
import AppNotifications from "@/components/ui/AppNotifications.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader v-if="authStore.isAuthenticated" />

    <AppErrorBoundary :reset-key="route.fullPath">
      <RouterView />
    </AppErrorBoundary>

    <AppNotifications />
  </div>
</template>

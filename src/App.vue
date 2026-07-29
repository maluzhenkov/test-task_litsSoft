<script setup lang="ts">
import { RouterView } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppNotifications from "@/components/ui/AppNotifications.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader v-if="authStore.isAuthenticated" />

    <RouterView />

    <AppNotifications />
  </div>
</template>

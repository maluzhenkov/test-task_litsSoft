<script setup lang="ts">
import LoginForm from "@/components/auth/LoginForm.vue";
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center px-4 py-10">
    <div class="w-full max-w-sm space-y-6">
      <div class="space-y-1 text-center">
        <h1 class="text-2xl font-semibold">Трекер задач</h1>
        <p class="text-sm text-slate-500">Войдите, чтобы продолжить</p>
      </div>

      <LoginForm />

      <p class="text-center text-xs text-slate-400">
        Тестовый доступ: test@test.com / 12345678
      </p>
    </div>
  </main>
</template>

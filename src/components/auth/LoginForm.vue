<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const isTouched = ref(false);

const emailError = computed(() => {
  if (!isTouched.value) return null;
  if (!email.value.trim()) return "Введите email";
  if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) return "Некорректный email";

  return null;
});

const passwordError = computed(() => {
  if (!isTouched.value) return null;

  return password.value ? null : "Введите пароль";
});

const isValid = computed(() => !emailError.value && !passwordError.value);

const handleSubmit = async () => {
  isTouched.value = true;
  if (!isValid.value) return;

  const isLoggedIn = await authStore.login({
    email: email.value.trim(),
    password: password.value,
  });

  if (!isLoggedIn) return;

  const { redirect } = route.query;
  await router.push(
    typeof redirect === "string" ? redirect : { name: "tasks" },
  );
};
</script>

<template>
  <form class="card space-y-4 sm:p-6" novalidate @submit.prevent="handleSubmit">
    <div>
      <label class="field-label" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        class="field"
        type="email"
        autocomplete="email"
        placeholder="test@test.com"
        :aria-invalid="Boolean(emailError)"
        :disabled="authStore.isLoading"
      />
      <p v-if="emailError" class="field-error">{{ emailError }}</p>
    </div>

    <div>
      <label class="field-label" for="password">Пароль</label>
      <input
        id="password"
        v-model="password"
        class="field"
        type="password"
        autocomplete="current-password"
        placeholder="••••••••"
        :aria-invalid="Boolean(passwordError)"
        :disabled="authStore.isLoading"
      />
      <p v-if="passwordError" class="field-error">{{ passwordError }}</p>
    </div>

    <p
      v-if="authStore.error"
      class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
      role="alert"
    >
      {{ authStore.error }}
    </p>

    <button
      type="submit"
      class="btn btn-primary w-full"
      :disabled="authStore.isLoading"
    >
      {{ authStore.isLoading ? "Входим…" : "Войти" }}
    </button>
  </form>
</template>

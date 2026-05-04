<script setup lang="ts">
const password = ref("");
const submitting = ref(false);
const error = ref<string | null>(null);
const route = useRoute();

useHead({ title: "Admin sign in" });

const submit = async () => {
  error.value = null;
  submitting.value = true;
  try {
    await $fetch("/api/admin/login", {
      method: "POST",
      body: { password: password.value },
    });
    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/admin";
    await navigateTo(redirect);
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 429) {
      error.value = "Too many attempts. Try again later.";
    } else if (status === 401) {
      error.value = "Wrong password.";
    } else {
      error.value = "Login failed.";
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
    <form
      class="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
      @submit.prevent="submit"
    >
      <div>
        <h1 class="text-xl font-bold">Admin sign in</h1>
        <p class="mt-1 text-sm text-neutral-500">
          Enter the upload password to manage albums.
        </p>
      </div>
      <UFormField label="Password" required>
        <UInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          autofocus
          :disabled="submitting"
          class="w-full"
        />
      </UFormField>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <UButton
        type="submit"
        color="primary"
        :loading="submitting"
        :disabled="submitting || !password"
        block
      >
        Sign in
      </UButton>
    </form>
  </div>
</template>

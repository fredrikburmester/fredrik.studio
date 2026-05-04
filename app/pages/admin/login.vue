<script setup lang="ts">
const password = ref("");
const submitting = ref(false);
const error = ref<string | null>(null);
const route = useRoute();

useHead({ title: "Sign in — Studio" });

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
  <div class="login-shell flex min-h-screen items-center justify-center px-4 antialiased">
    <div class="w-full max-w-[380px]">
      <form
        class="space-y-6 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-[0_1px_0_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
        @submit.prevent="submit"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-sm">
            <UIcon name="i-heroicons-lock-closed" class="h-5 w-5" />
          </div>
          <div class="space-y-1">
            <h1 class="text-[22px] font-semibold tracking-tight text-neutral-900">
              Sign in to Studio
            </h1>
            <p class="text-[13px] text-neutral-500">
              Enter the upload password to manage albums.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-[12px] font-medium text-neutral-700">
            Password
          </label>
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            autofocus
            :disabled="submitting"
            placeholder="••••••••"
            class="w-full"
            size="lg"
          />
        </div>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <p
            v-if="error"
            class="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-[13px] text-red-700"
          >
            {{ error }}
          </p>
        </Transition>

        <button
          type="submit"
          :disabled="submitting || !password"
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-neutral-900 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(0,0,0,0.4)] transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <UIcon
            v-if="submitting"
            name="i-heroicons-arrow-path"
            class="h-4 w-4 animate-spin"
          />
          {{ submitting ? "Signing in" : "Sign in" }}
        </button>
      </form>

      <p class="mt-6 text-center text-[12px] text-neutral-400">
        Studio · Admin
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-shell {
  background:
    radial-gradient(1200px 600px at 0% 0%, rgba(250, 204, 20, 0.18), transparent 55%),
    radial-gradient(900px 500px at 100% 100%, rgba(99, 102, 241, 0.12), transparent 55%),
    linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%);
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Text",
    "SF Pro Display",
    "Helvetica Neue",
    system-ui,
    sans-serif;
  letter-spacing: -0.011em;
}
</style>

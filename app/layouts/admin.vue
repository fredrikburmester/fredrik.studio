<script setup lang="ts">
const { logout } = useAdminFetch();
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <header
      class="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6"
      >
        <NuxtLink to="/admin" class="text-lg font-bold">Admin</NuxtLink>
        <NuxtLink
          to="/admin"
          class="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Albums
        </NuxtLink>
        <div class="ml-auto flex items-center gap-2">
          <NuxtLink
            to="/"
            class="text-sm text-neutral-500 hover:text-neutral-900"
          >
            View site
          </NuxtLink>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-arrow-right-on-rectangle"
            @click="logout"
          >
            Log out
          </UButton>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <slot />
    </main>
  </div>
</template>

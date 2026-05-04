<script setup lang="ts">
const { logout } = useAdminFetch();
const route = useRoute();

const isAlbumDetail = computed(() => route.path.startsWith("/admin/") && route.path !== "/admin");
</script>

<template>
  <div class="admin-shell min-h-screen text-neutral-900 antialiased">
    <header class="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl backdrop-saturate-150">
      <div class="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 sm:px-8">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-neutral-900"
        >
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-sm">
            <UIcon name="i-heroicons-square-3-stack-3d" class="h-4 w-4" />
          </span>
          Studio
        </NuxtLink>

        <nav class="ml-2 hidden items-center gap-1 sm:flex">
          <NuxtLink
            to="/admin"
            :class="[
              'rounded-full px-3 py-1.5 text-[13px] font-medium transition',
              !isAlbumDetail
                ? 'bg-neutral-900/5 text-neutral-900'
                : 'text-neutral-500 hover:bg-neutral-900/5 hover:text-neutral-900',
            ]"
          >
            Albums
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-1.5">
          <NuxtLink
            to="/"
            target="_blank"
            class="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-900 sm:inline-flex"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-3.5 w-3.5" />
            View site
          </NuxtLink>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-900"
            @click="logout"
          >
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(250, 204, 20, 0.10), transparent 60%),
    radial-gradient(900px 500px at 100% 0%, rgba(99, 102, 241, 0.08), transparent 55%),
    linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%);
  font-feature-settings: "ss01", "cv11";
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

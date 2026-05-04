<script setup lang="ts">
import type { AlbumCollection, AlbumMeta } from "~/types";

definePageMeta({ layout: "admin", middleware: ["admin"] });
useHead({ title: "Studio — Albums" });

type VersionInfo = { path: string; timestamp: number } | null;

const { adminFetch } = useAdminFetch();
const { public: runtimePublic } = useRuntimeConfig();
const blobBaseUrl = runtimePublic.blobBaseUrl;

const posterUrl = (path?: string) => (path ? `${blobBaseUrl}/${path}` : null);

const albums = ref<AlbumCollection>([]);
const version = ref<VersionInfo>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const showForm = ref(false);
const editing = ref<AlbumMeta | null>(null);
const formError = ref<string | null>(null);
const formSubmitting = ref(false);

const deletingSlug = ref<string | null>(null);
const deleteConfirm = ref("");

const refresh = async () => {
  loading.value = true;
  error.value = null;
  try {
    albums.value = await $fetch<AlbumCollection>("/api/albums");
    const versionResponse = await $fetch<{ albums: AlbumCollection; version: VersionInfo }>(
      "/api/admin/albums-version",
    ).catch(() => null);
    if (versionResponse) version.value = versionResponse.version;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load albums";
  } finally {
    loading.value = false;
  }
};

await refresh();

const openCreate = () => {
  editing.value = null;
  formError.value = null;
  showForm.value = true;
};

const openEdit = (album: AlbumMeta) => {
  editing.value = album;
  formError.value = null;
  showForm.value = true;
};

const submitForm = async (payload: {
  title: string;
  slug?: string;
  description?: string;
}) => {
  formError.value = null;
  formSubmitting.value = true;
  try {
    if (editing.value) {
      const res = await adminFetch<{ version: VersionInfo }>(
        `/api/albums/${editing.value.slug}`,
        {
          method: "PATCH",
          body: { ...payload, baseVersion: version.value },
        },
      );
      version.value = res.version;
    } else {
      const res = await adminFetch<{ version: VersionInfo }>("/api/albums", {
        method: "POST",
        body: { ...payload, baseVersion: version.value },
      });
      version.value = res.version;
    }
    showForm.value = false;
    await refresh();
  } catch (err) {
    formError.value =
      (err as { statusMessage?: string })?.statusMessage ||
      (err instanceof Error ? err.message : "Save failed");
  } finally {
    formSubmitting.value = false;
  }
};

const togglePromoted = async (album: AlbumMeta) => {
  try {
    const res = await adminFetch<{ version: VersionInfo }>(
      `/api/albums/${album.slug}`,
      {
        method: "PATCH",
        body: {
          promoted: !album.promoted,
          baseVersion: version.value,
        },
      },
    );
    version.value = res.version;
    await refresh();
  } catch (err) {
    error.value =
      (err as { statusMessage?: string })?.statusMessage ||
      (err instanceof Error ? err.message : "Update failed");
  }
};

const askDelete = (slug: string) => {
  deletingSlug.value = slug;
  deleteConfirm.value = "";
};

const cancelDelete = () => {
  deletingSlug.value = null;
  deleteConfirm.value = "";
};

const confirmDelete = async () => {
  if (!deletingSlug.value || deleteConfirm.value !== deletingSlug.value) return;
  try {
    const res = await adminFetch<{ version: VersionInfo }>(
      `/api/albums/${deletingSlug.value}`,
      {
        method: "DELETE",
        body: {
          confirm: deletingSlug.value,
          baseVersion: version.value,
        },
      },
    );
    version.value = res.version;
    cancelDelete();
    await refresh();
  } catch (err) {
    error.value =
      (err as { statusMessage?: string })?.statusMessage ||
      (err instanceof Error ? err.message : "Delete failed");
  }
};

const promotedCount = computed(() => albums.value.filter((a) => a.promoted).length);
</script>

<template>
  <div class="space-y-10">
    <!-- Hero -->
    <section class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-2">
        <p class="text-[13px] font-medium uppercase tracking-[0.14em] text-neutral-400">
          Library
        </p>
        <h1 class="text-[42px] font-semibold leading-none tracking-tight text-neutral-900">
          Albums
        </h1>
        <p class="max-w-xl text-[15px] leading-relaxed text-neutral-500">
          Curate, arrange, and publish your collections.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-11 items-center gap-2 rounded-full bg-neutral-900 px-5 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(0,0,0,0.4)] transition hover:bg-neutral-800 active:scale-[0.98]"
        @click="openCreate"
      >
        <UIcon name="i-heroicons-plus" class="h-4 w-4" />
        New album
      </button>
    </section>

    <!-- Stats strip -->
    <section
      v-if="albums.length"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur">
        <p class="text-[12px] font-medium uppercase tracking-wider text-neutral-400">Total</p>
        <p class="mt-1 text-3xl font-semibold tracking-tight">{{ albums.length }}</p>
      </div>
      <div class="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur">
        <p class="text-[12px] font-medium uppercase tracking-wider text-neutral-400">Promoted</p>
        <p class="mt-1 text-3xl font-semibold tracking-tight">{{ promotedCount }}</p>
      </div>
      <div class="hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur sm:block">
        <p class="text-[12px] font-medium uppercase tracking-wider text-neutral-400">Hidden</p>
        <p class="mt-1 text-3xl font-semibold tracking-tight">{{ albums.length - promotedCount }}</p>
      </div>
    </section>

    <p
      v-if="error"
      class="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-[13px] text-red-700 backdrop-blur"
    >
      {{ error }}
    </p>

    <!-- Album grid -->
    <ul
      v-if="albums.length"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li
        v-for="album in albums"
        :key="album.slug"
        class="group relative flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_1px_0_rgba(0,0,0,0.04),0_20px_40px_-24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(0,0,0,0.04),0_28px_50px_-22px_rgba(0,0,0,0.25)]"
      >
        <NuxtLink
          :to="`/admin/${album.slug}`"
          class="relative block aspect-[5/3] overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200"
        >
          <img
            v-if="album.posterImage"
            :src="posterUrl(album.posterImage)!"
            :alt="album.title"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-neutral-300"
          >
            <UIcon name="i-heroicons-photo" class="h-10 w-10" />
          </div>

          <div class="absolute right-3 top-3">
            <span
              :class="[
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md',
                album.promoted
                  ? 'bg-emerald-500/90 text-white shadow-sm'
                  : 'bg-black/40 text-white',
              ]"
            >
              <span
                :class="[
                  'h-1.5 w-1.5 rounded-full',
                  album.promoted ? 'bg-white' : 'bg-white/70',
                ]"
              />
              {{ album.promoted ? "Promoted" : "Hidden" }}
            </span>
          </div>
        </NuxtLink>

        <div class="flex flex-1 flex-col gap-3 p-5">
          <div class="min-w-0 space-y-1">
            <NuxtLink
              :to="`/admin/${album.slug}`"
              class="block truncate text-[17px] font-semibold tracking-tight text-neutral-900 hover:text-neutral-700"
            >
              {{ album.title }}
            </NuxtLink>
            <p class="truncate font-mono text-[11px] text-neutral-400">/{{ album.slug }}</p>
            <p
              v-if="album.description"
              class="line-clamp-2 pt-1 text-[13px] leading-relaxed text-neutral-600"
            >
              {{ album.description }}
            </p>
          </div>

          <div class="mt-auto flex items-center justify-between gap-1 border-t border-neutral-900/5 pt-3">
            <NuxtLink
              :to="`/admin/${album.slug}`"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-neutral-700 transition hover:bg-neutral-900/5"
            >
              <UIcon name="i-heroicons-photo" class="h-3.5 w-3.5" />
              Manage
            </NuxtLink>

            <div class="flex items-center gap-0.5">
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-900"
                :title="`Edit ${album.title}`"
                @click="openEdit(album)"
              >
                <UIcon name="i-heroicons-pencil-square" class="h-4 w-4" />
              </button>
              <button
                type="button"
                :class="[
                  'inline-flex h-8 w-8 items-center justify-center rounded-full transition',
                  album.promoted
                    ? 'text-emerald-600 hover:bg-emerald-500/10'
                    : 'text-neutral-500 hover:bg-neutral-900/5 hover:text-neutral-900',
                ]"
                :title="album.promoted ? 'Unpromote' : 'Promote'"
                @click="togglePromoted(album)"
              >
                <UIcon
                  :name="album.promoted ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  class="h-4 w-4"
                />
              </button>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-red-500/10 hover:text-red-600"
                :title="`Delete ${album.title}`"
                @click="askDelete(album.slug)"
              >
                <UIcon name="i-heroicons-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!-- Empty state -->
    <div
      v-else-if="!loading"
      class="rounded-3xl border border-dashed border-neutral-300 bg-white/50 px-8 py-16 text-center backdrop-blur"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900/5">
        <UIcon name="i-heroicons-square-3-stack-3d" class="h-6 w-6 text-neutral-500" />
      </div>
      <h2 class="mt-4 text-[17px] font-semibold tracking-tight">No albums yet</h2>
      <p class="mt-1 text-[13px] text-neutral-500">
        Start by creating your first collection.
      </p>
      <button
        type="button"
        class="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-neutral-900 px-5 text-[13px] font-medium text-white shadow-sm transition hover:bg-neutral-800"
        @click="openCreate"
      >
        <UIcon name="i-heroicons-plus" class="h-4 w-4" />
        Create album
      </button>
    </div>

    <AdminAlbumFormModal
      v-model="showForm"
      :album="editing"
      :submitting="formSubmitting"
      :error="formError"
      @submit="submitForm"
    />

    <UModal :open="!!deletingSlug" @update:open="(v) => !v && cancelDelete()">
      <template #content>
        <div class="space-y-5 p-7">
          <div class="flex items-start gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5" />
            </div>
            <div class="space-y-1">
              <h2 class="text-[17px] font-semibold tracking-tight">Delete album</h2>
              <p class="text-[13px] leading-relaxed text-neutral-600">
                This permanently removes the album and every image inside it. To confirm, type
                <code class="rounded-md bg-neutral-900/5 px-1.5 py-0.5 font-mono text-[12px] text-neutral-800">{{ deletingSlug }}</code>
                below.
              </p>
            </div>
          </div>
          <UInput
            v-model="deleteConfirm"
            class="w-full"
            placeholder="Type slug to confirm"
            autofocus
          />
          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-900/5"
              @click="cancelDelete"
            >
              Cancel
            </button>
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-full bg-red-600 px-4 text-[13px] font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="deleteConfirm !== deletingSlug"
              @click="confirmDelete"
            >
              Delete album
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

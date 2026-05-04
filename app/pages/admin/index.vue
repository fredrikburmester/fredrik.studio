<script setup lang="ts">
import type { AlbumCollection, AlbumMeta } from "~/types";

definePageMeta({ layout: "admin", middleware: ["admin"] });
useHead({ title: "Admin — Albums" });

type VersionInfo = { path: string; timestamp: number } | null;

const { adminFetch } = useAdminFetch();

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
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Albums</h1>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="openCreate"
      >
        New album
      </UButton>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <ul
      v-if="albums.length"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <li
        v-for="album in albums"
        :key="album.slug"
        class="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <NuxtLink
              :to="`/admin/${album.slug}`"
              class="text-lg font-semibold hover:underline"
            >
              {{ album.title }}
            </NuxtLink>
            <p class="truncate text-xs text-neutral-500">/{{ album.slug }}</p>
            <p
              v-if="album.description"
              class="mt-1 text-sm text-neutral-700"
            >
              {{ album.description }}
            </p>
          </div>
          <UBadge
            :color="album.promoted ? 'primary' : 'neutral'"
            :variant="album.promoted ? 'solid' : 'soft'"
          >
            {{ album.promoted ? "Promoted" : "Hidden" }}
          </UBadge>
        </div>
        <div class="mt-1 flex flex-wrap gap-2">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-photo"
            :to="`/admin/${album.slug}`"
          >
            Manage images
          </UButton>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-pencil"
            @click="openEdit(album)"
          >
            Edit
          </UButton>
          <UButton
            size="xs"
            :color="album.promoted ? 'neutral' : 'primary'"
            variant="ghost"
            :icon="album.promoted ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
            @click="togglePromoted(album)"
          >
            {{ album.promoted ? "Unpromote" : "Promote" }}
          </UButton>
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            @click="askDelete(album.slug)"
          >
            Delete
          </UButton>
        </div>
      </li>
    </ul>

    <p v-else-if="!loading" class="text-sm text-neutral-500">
      No albums yet. Create your first one.
    </p>

    <AdminAlbumFormModal
      v-model="showForm"
      :album="editing"
      :submitting="formSubmitting"
      :error="formError"
      @submit="submitForm"
    />

    <UModal :open="!!deletingSlug" @update:open="(v) => !v && cancelDelete()">
      <template #content>
        <div class="space-y-4 p-6">
          <h2 class="text-lg font-semibold">Delete album</h2>
          <p class="text-sm text-neutral-700">
            This permanently removes the album and all its images. Type
            <code class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">{{ deletingSlug }}</code>
            to confirm.
          </p>
          <UInput v-model="deleteConfirm" class="w-full" />
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="cancelDelete">
              Cancel
            </UButton>
            <UButton
              color="error"
              :disabled="deleteConfirm !== deletingSlug"
              @click="confirmDelete"
            >
              Delete album
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

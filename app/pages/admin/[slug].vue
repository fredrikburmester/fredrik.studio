<script setup lang="ts">
import type { AlbumMeta, ReturnItem, ReturnType } from "~/types";

definePageMeta({ layout: "admin", middleware: ["admin"] });

type VersionInfo = { path: string; timestamp: number } | null;

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { adminFetch } = useAdminFetch();
const { public: runtimePublic } = useRuntimeConfig();
const blobBaseUrl = runtimePublic.blobBaseUrl;

const album = ref<AlbumMeta | null>(null);
const items = ref<ReturnType>([]);
const itemsVersion = ref<VersionInfo>(null);
const albumsVersion = ref<VersionInfo>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const busyName = ref<string | null>(null);
const dirty = ref(false);
const savingOrder = ref(false);
const lastUploadError = ref<string | null>(null);

useHead({ title: () => `Admin — ${album.value?.title ?? slug.value}` });

const loadAlbum = async () => {
  album.value = await $fetch<AlbumMeta>(`/api/albums/${slug.value}/album`);
};

const loadItems = async () => {
  const data = await adminFetch<{ items: ReturnType; version: VersionInfo }>(
    `/api/admin/album-meta-version?slug=${encodeURIComponent(slug.value)}`,
  );
  items.value = data.items;
  itemsVersion.value = data.version;
  dirty.value = false;
};

const loadAlbumsVersion = async () => {
  const data = await adminFetch<{ version: VersionInfo }>(
    "/api/admin/albums-version",
  );
  albumsVersion.value = data.version;
};

const refresh = async () => {
  loading.value = true;
  error.value = null;
  try {
    await Promise.all([loadAlbum(), loadItems(), loadAlbumsVersion()]);
  } catch (err) {
    error.value =
      (err as { statusMessage?: string })?.statusMessage ||
      (err instanceof Error ? err.message : "Failed to load album");
  } finally {
    loading.value = false;
  }
};

await refresh();

const onReorder = (next: ReturnItem[]) => {
  items.value = next;
  dirty.value = true;
};

const saveOrder = async () => {
  savingOrder.value = true;
  error.value = null;
  try {
    const res = await adminFetch<{ version: VersionInfo }>(
      `/api/albums/${slug.value}/images`,
      {
        method: "PATCH",
        body: {
          order: items.value.map((i: ReturnItem) => i.name),
          baseVersion: itemsVersion.value,
        },
      },
    );
    itemsVersion.value = res.version;
    dirty.value = false;
  } catch (err) {
    if ((err as { statusCode?: number })?.statusCode === 409) {
      error.value = "Album changed elsewhere. Reloading...";
      await loadItems();
    } else {
      error.value =
        (err as { statusMessage?: string })?.statusMessage ||
        (err instanceof Error ? err.message : "Save failed");
    }
  } finally {
    savingOrder.value = false;
  }
};

const commitUploads = async (
  uploads: { blobUrl: string; originalName: string }[],
) => {
  lastUploadError.value = null;
  try {
    const res = await adminFetch<{ items: ReturnItem[]; version: VersionInfo }>(
      `/api/albums/${slug.value}/images`,
      {
        method: "POST",
        body: { uploads, baseVersion: itemsVersion.value },
      },
    );
    items.value = [...items.value, ...res.items];
    itemsVersion.value = res.version;
    dirty.value = false;
  } catch (err) {
    if ((err as { statusCode?: number })?.statusCode === 409) {
      lastUploadError.value =
        "Album changed elsewhere; refresh and retry the upload.";
      await loadItems();
    } else {
      lastUploadError.value =
        (err as { statusMessage?: string })?.statusMessage ||
        (err instanceof Error ? err.message : "Upload failed");
    }
    throw err;
  }
};

const onUploadError = (msg: string) => {
  lastUploadError.value = msg;
};

const deleteImage = async (item: ReturnItem) => {
  busyName.value = item.name;
  try {
    const res = await adminFetch<{ version: VersionInfo }>(
      `/api/albums/${slug.value}/images/${encodeURIComponent(item.name)}`,
      {
        method: "DELETE",
        body: { baseVersion: itemsVersion.value },
      },
    );
    items.value = items.value.filter((i: ReturnItem) => i.name !== item.name);
    itemsVersion.value = res.version;
  } catch (err) {
    if ((err as { statusCode?: number })?.statusCode === 409) {
      error.value = "Album changed elsewhere. Reloading...";
      await loadItems();
    } else {
      error.value =
        (err as { statusMessage?: string })?.statusMessage ||
        (err instanceof Error ? err.message : "Delete failed");
    }
  } finally {
    busyName.value = null;
  }
};

const setCover = async (item: ReturnItem) => {
  if (!album.value) return;
  const path = `albums/${slug.value}/thumbs/${item.name}`;
  try {
    const res = await adminFetch<{ album: AlbumMeta; version: VersionInfo }>(
      `/api/albums/${slug.value}`,
      {
        method: "PATCH",
        body: {
          coverImage: path,
          baseVersion: albumsVersion.value,
        },
      },
    );
    albumsVersion.value = res.version;
    album.value = res.album;
  } catch (err) {
    error.value =
      (err as { statusMessage?: string })?.statusMessage ||
      (err instanceof Error ? err.message : "Could not set cover");
  }
};

const isCover = (name: string) =>
  album.value?.coverImage === `albums/${slug.value}/thumbs/${name}`;
</script>

<template>
  <div class="space-y-6">
    <NuxtLink
      to="/admin"
      class="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
    >
      <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" /> All albums
    </NuxtLink>

    <div class="flex items-start justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold">{{ album?.title ?? slug }}</h1>
        <p class="text-sm text-neutral-500">/{{ slug }}</p>
        <p
          v-if="album?.description"
          class="mt-1 max-w-prose text-sm text-neutral-700"
        >
          {{ album.description }}
        </p>
      </div>
      <UButton
        v-if="dirty"
        color="primary"
        icon="i-heroicons-check"
        :loading="savingOrder"
        @click="saveOrder"
      >
        Save order
      </UButton>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <AdminImageUploadDropzone
      :slug="slug"
      :commit="commitUploads"
      @error="onUploadError"
    />
    <p v-if="lastUploadError" class="text-sm text-red-600">
      {{ lastUploadError }}
    </p>

    <div v-if="items.length">
      <AdminImageGridSortable
        :items="items"
        :slug="slug"
        :blob-base-url="blobBaseUrl"
        :busy-name="busyName"
        :is-cover="isCover"
        @reorder="onReorder"
        @delete="deleteImage"
        @set-cover="setCover"
      />
    </div>
    <p v-else-if="!loading" class="text-sm text-neutral-500">
      No images in this album yet. Upload some above.
    </p>
  </div>
</template>

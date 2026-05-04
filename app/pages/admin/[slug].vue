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

useHead({ title: () => `Studio — ${album.value?.title ?? slug.value}` });

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
          posterImage: path,
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
  album.value?.posterImage === `albums/${slug.value}/thumbs/${name}`;

const coverUrl = computed(() =>
  album.value?.posterImage ? `${blobBaseUrl}/${album.value.posterImage}` : null,
);
</script>

<template>
  <div class="space-y-10">
    <!-- Breadcrumb -->
    <NuxtLink
      to="/admin"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 -ml-3 text-[13px] font-medium text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-900"
    >
      <UIcon name="i-heroicons-chevron-left" class="h-3.5 w-3.5" />
      Albums
    </NuxtLink>

    <!-- Album header card -->
    <section
      class="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_1px_0_rgba(0,0,0,0.04),0_24px_50px_-30px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-8"
    >
      <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          class="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] sm:w-32"
        >
          <img
            v-if="coverUrl"
            :src="coverUrl"
            :alt="album?.title"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-neutral-300"
          >
            <UIcon name="i-heroicons-photo" class="h-7 w-7" />
          </div>
        </div>

        <div class="min-w-0 flex-1 space-y-2">
          <p class="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            /{{ slug }}
          </p>
          <h1 class="text-[34px] font-semibold leading-none tracking-tight text-neutral-900">
            {{ album?.title ?? slug }}
          </h1>
          <p
            v-if="album?.description"
            class="max-w-prose text-[14px] leading-relaxed text-neutral-600"
          >
            {{ album.description }}
          </p>

          <div class="flex flex-wrap items-center gap-2 pt-2 text-[12px] text-neutral-500">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-neutral-900/5 px-2.5 py-1 font-medium text-neutral-700">
              <UIcon name="i-heroicons-photo" class="h-3.5 w-3.5" />
              {{ items.length }} {{ items.length === 1 ? "image" : "images" }}
            </span>
            <span
              v-if="album?.promoted"
              class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Promoted
            </span>
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <button
            v-if="dirty"
            type="button"
            :disabled="savingOrder"
            class="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(0,0,0,0.4)] transition hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-60"
            @click="saveOrder"
          >
            <UIcon
              :name="savingOrder ? 'i-heroicons-arrow-path' : 'i-heroicons-check'"
              :class="['h-4 w-4', savingOrder && 'animate-spin']"
            />
            {{ savingOrder ? "Saving" : "Save order" }}
          </button>
        </Transition>
      </div>
    </section>

    <p
      v-if="error"
      class="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-[13px] text-red-700 backdrop-blur"
    >
      {{ error }}
    </p>

    <!-- Upload section -->
    <section class="space-y-3">
      <div class="flex items-baseline justify-between">
        <h2 class="text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Upload
        </h2>
      </div>
      <AdminImageUploadDropzone
        :slug="slug"
        :commit="commitUploads"
        @error="onUploadError"
      />
      <p
        v-if="lastUploadError"
        class="rounded-xl border border-red-200 bg-red-50/70 px-4 py-2.5 text-[13px] text-red-700 backdrop-blur"
      >
        {{ lastUploadError }}
      </p>
    </section>

    <!-- Images grid section -->
    <section class="space-y-3">
      <div class="flex items-baseline justify-between">
        <h2 class="text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Images
        </h2>
        <p v-if="items.length" class="text-[12px] text-neutral-400">
          Drag to reorder · hover for actions
        </p>
      </div>

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

      <div
        v-else-if="!loading"
        class="rounded-3xl border border-dashed border-neutral-300 bg-white/50 px-6 py-14 text-center backdrop-blur"
      >
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900/5">
          <UIcon name="i-heroicons-photo" class="h-5 w-5 text-neutral-500" />
        </div>
        <p class="mt-3 text-[14px] font-medium text-neutral-700">No images yet</p>
        <p class="mt-1 text-[13px] text-neutral-500">
          Drop files into the area above to get started.
        </p>
      </div>
    </section>
  </div>
</template>

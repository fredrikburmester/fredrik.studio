<script setup lang="ts">
import type { AlbumCollection, AlbumMeta } from "~/types";

definePageMeta({ layout: "admin", middleware: ["admin"] });
useHead({ title: "Studio — Albums" });

type VersionInfo = { path: string; timestamp: number } | null;

const { adminFetch } = useAdminFetch();
const { public: runtimePublic } = useRuntimeConfig();
const blobBaseUrl = runtimePublic.blobBaseUrl;

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

const orderStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let savedFlashTimer: ReturnType<typeof setTimeout> | null = null;

const refresh = async () => {
  loading.value = true;
  error.value = null;
  try {
    const versionResponse = await adminFetch<{
      albums: AlbumCollection;
      version: VersionInfo;
    }>("/api/admin/albums-version").catch(() => null);
    if (versionResponse) {
      albums.value = versionResponse.albums;
      version.value = versionResponse.version;
    } else {
      albums.value = await $fetch<AlbumCollection>("/api/albums");
    }
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
  type?: string;
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

const saveOrder = async () => {
  orderStatus.value = "saving";
  error.value = null;
  try {
    const res = await adminFetch<{ version: VersionInfo }>(
      "/api/albums/order",
      {
        method: "PATCH",
        body: {
          order: albums.value.map((a) => a.slug),
          baseVersion: version.value,
        },
      },
    );
    version.value = res.version;
    orderStatus.value = "saved";
    if (savedFlashTimer) clearTimeout(savedFlashTimer);
    savedFlashTimer = setTimeout(() => {
      if (orderStatus.value === "saved") orderStatus.value = "idle";
    }, 1500);
  } catch (err) {
    orderStatus.value = "error";
    if ((err as { statusCode?: number })?.statusCode === 409) {
      error.value = "Albums changed elsewhere. Reloading...";
      await refresh();
    } else {
      error.value =
        (err as { statusMessage?: string })?.statusMessage ||
        (err instanceof Error ? err.message : "Save failed");
    }
  }
};

const onReorder = (next: AlbumMeta[]) => {
  albums.value = next;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveOrder();
  }, 350);
};

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer);
  if (savedFlashTimer) clearTimeout(savedFlashTimer);
});
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
    </section>

    <p
      v-if="error"
      class="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-[13px] text-red-700 backdrop-blur"
    >
      {{ error }}
    </p>

    <!-- Album list -->
    <section v-if="albums.length" class="space-y-3">
      <div class="flex items-baseline justify-between">
        <p class="text-[12px] text-neutral-400">
          Drag the handle to reorder · saves automatically
        </p>
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <span
            v-if="orderStatus !== 'idle'"
            :class="[
              'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium',
              orderStatus === 'saving' && 'bg-neutral-900/5 text-neutral-600',
              orderStatus === 'saved' && 'bg-emerald-500/10 text-emerald-700',
              orderStatus === 'error' && 'bg-red-500/10 text-red-700',
            ]"
          >
            <UIcon
              :name="
                orderStatus === 'saving'
                  ? 'i-heroicons-arrow-path'
                  : orderStatus === 'saved'
                    ? 'i-heroicons-check'
                    : 'i-heroicons-exclamation-triangle'
              "
              :class="['h-3 w-3', orderStatus === 'saving' && 'animate-spin']"
            />
            {{
              orderStatus === "saving"
                ? "Saving order"
                : orderStatus === "saved"
                  ? "Saved"
                  : "Save failed"
            }}
          </span>
        </Transition>
      </div>

      <AdminAlbumListSortable
        :albums="albums"
        :blob-base-url="blobBaseUrl"
        @reorder="onReorder"
        @edit="openEdit"
        @toggle-promoted="togglePromoted"
        @delete="askDelete"
      />
    </section>

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

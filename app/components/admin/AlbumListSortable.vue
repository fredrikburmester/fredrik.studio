<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import type { AlbumMeta } from "~/types";

const props = defineProps<{
  albums: AlbumMeta[];
  blobBaseUrl: string;
}>();

const emit = defineEmits<{
  reorder: [next: AlbumMeta[]];
  edit: [album: AlbumMeta];
  togglePromoted: [album: AlbumMeta];
  delete: [slug: string];
}>();

const local = ref<AlbumMeta[]>([...props.albums]);

watch(
  () => props.albums,
  (next) => {
    local.value = [...next];
  },
);

const swap = (a: number, b: number) => {
  const next = [...local.value];
  const aItem = next[a];
  const bItem = next[b];
  if (!aItem || !bItem) return;
  next[a] = bItem;
  next[b] = aItem;
  local.value = next;
  emit("reorder", next);
};

const moveUp = (idx: number) => {
  if (idx <= 0) return;
  swap(idx - 1, idx);
};

const moveDown = (idx: number) => {
  if (idx >= local.value.length - 1) return;
  swap(idx, idx + 1);
};

const onSorted = () => {
  emit("reorder", [...local.value]);
};

const posterUrl = (path?: string) =>
  path ? `${props.blobBaseUrl}/${path}` : null;
</script>

<template>
  <ClientOnly>
    <VueDraggable
      v-model="local"
      :animation="220"
      handle=".drag-handle"
      tag="ul"
      item-key="slug"
      class="flex flex-col gap-2"
      ghost-class="opacity-30"
      chosen-class="!shadow-2xl"
      drag-class="!cursor-grabbing"
      @end="onSorted"
    >
      <li
        v-for="(album, idx) in local"
        :key="album.slug"
        class="group flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 p-2 pr-3 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_20px_-16px_rgba(0,0,0,0.25)] backdrop-blur transition hover:bg-white"
      >
        <!-- Drag handle -->
        <button
          type="button"
          class="drag-handle inline-flex h-12 w-7 shrink-0 cursor-grab items-center justify-center rounded-xl text-neutral-400 transition hover:bg-neutral-900/5 hover:text-neutral-700 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <UIcon name="i-heroicons-bars-3" class="h-4 w-4" />
        </button>

        <!-- Index -->
        <span
          class="inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-900/5 font-mono text-[11px] font-semibold text-neutral-600"
        >
          {{ idx + 1 }}
        </span>

        <!-- Poster thumbnail -->
        <NuxtLink
          :to="`/admin/${album.slug}`"
          class="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
        >
          <img
            v-if="album.posterImage"
            :src="posterUrl(album.posterImage)!"
            :alt="album.title"
            class="h-full w-full object-cover"
            loading="lazy"
            draggable="false"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-neutral-300"
          >
            <UIcon name="i-heroicons-photo" class="h-5 w-5" />
          </div>
        </NuxtLink>

        <!-- Title + slug + description -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/admin/${album.slug}`"
              class="truncate text-[14px] font-semibold tracking-tight text-neutral-900 hover:text-neutral-700"
            >
              {{ album.title }}
            </NuxtLink>
            <span
              v-if="album.promoted"
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white"
            >
              <span class="h-1 w-1 rounded-full bg-white" />
              Promoted
            </span>
          </div>
          <p class="mt-0.5 truncate font-mono text-[11px] text-neutral-400">
            /{{ album.slug }}
          </p>
          <p
            v-if="album.description"
            class="truncate text-[12px] text-neutral-500"
          >
            {{ album.description }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="idx === 0"
            :aria-label="`Move ${album.title} up`"
            @click="moveUp(idx)"
          >
            <UIcon name="i-heroicons-arrow-up" class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="idx === local.length - 1"
            :aria-label="`Move ${album.title} down`"
            @click="moveDown(idx)"
          >
            <UIcon name="i-heroicons-arrow-down" class="h-4 w-4" />
          </button>
          <NuxtLink
            :to="`/admin/${album.slug}`"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-800"
            :aria-label="`Manage ${album.title}`"
          >
            <UIcon name="i-heroicons-photo" class="h-4 w-4" />
          </NuxtLink>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-800"
            :aria-label="`Edit ${album.title}`"
            @click="emit('edit', album)"
          >
            <UIcon name="i-heroicons-pencil-square" class="h-4 w-4" />
          </button>
          <button
            type="button"
            :class="[
              'inline-flex h-8 w-8 items-center justify-center rounded-full transition',
              album.promoted
                ? 'text-emerald-600 hover:bg-emerald-500/10'
                : 'text-neutral-500 hover:bg-neutral-900/5 hover:text-neutral-800',
            ]"
            :aria-label="album.promoted ? `Unpromote ${album.title}` : `Promote ${album.title}`"
            @click="emit('togglePromoted', album)"
          >
            <UIcon
              :name="album.promoted ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
              class="h-4 w-4"
            />
          </button>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-500/10"
            :aria-label="`Delete ${album.title}`"
            @click="emit('delete', album.slug)"
          >
            <UIcon name="i-heroicons-trash" class="h-4 w-4" />
          </button>
        </div>
      </li>
    </VueDraggable>
  </ClientOnly>
</template>

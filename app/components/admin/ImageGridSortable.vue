<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import type { ReturnItem } from "~/types";

const props = defineProps<{
  items: ReturnItem[];
  slug: string;
  blobBaseUrl: string;
  busyName?: string | null;
  isCover?: (name: string) => boolean;
}>();

const emit = defineEmits<{
  reorder: [next: ReturnItem[]];
  delete: [item: ReturnItem];
  setCover: [item: ReturnItem];
}>();

const local = ref<ReturnItem[]>([...props.items]);

watch(
  () => props.items,
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

const thumb = (name: string) =>
  `${props.blobBaseUrl}/albums/${props.slug}/thumbs/${name}`;
</script>

<template>
  <ClientOnly>
    <VueDraggable
      v-model="local"
      :animation="220"
      handle=".drag-handle"
      tag="ul"
      item-key="name"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      ghost-class="opacity-30"
      chosen-class="!scale-[1.04] !shadow-2xl"
      @end="onSorted"
    >
      <li
        v-for="(item, idx) in local"
        :key="item.name"
        class="group relative aspect-square overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_10px_24px_-16px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(0,0,0,0.04),0_18px_36px_-18px_rgba(0,0,0,0.4)]"
        :style="{ backgroundColor: `rgb(${item.dominantColor.join(',')})` }"
      >
        <img
          :src="thumb(item.name)"
          :alt="item.name"
          class="h-full w-full object-cover"
          loading="lazy"
        />

        <!-- Top: index pill + cover star -->
        <div class="pointer-events-none absolute left-2 top-2 flex items-center gap-1">
          <span
            class="inline-flex items-center justify-center rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md"
          >
            {{ idx + 1 }}
          </span>
          <span
            v-if="isCover && isCover(item.name)"
            class="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[11px] font-semibold text-amber-950 shadow-sm backdrop-blur-md"
          >
            <UIcon name="i-heroicons-star-solid" class="h-3 w-3" />
            Cover
          </span>
        </div>

        <!-- Top right: drag handle -->
        <button
          type="button"
          class="drag-handle absolute right-2 top-2 inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <UIcon name="i-heroicons-bars-3" class="h-3.5 w-3.5" />
        </button>

        <!-- Bottom action bar -->
        <div
          class="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between gap-1 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="idx === 0"
              :aria-label="`Move ${item.name} earlier`"
              @click="moveUp(idx)"
            >
              <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="idx === local.length - 1"
              :aria-label="`Move ${item.name} later`"
              @click="moveDown(idx)"
            >
              <UIcon name="i-heroicons-arrow-right" class="h-3.5 w-3.5" />
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              :class="[
                'inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition',
                isCover && isCover(item.name)
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                  : 'bg-white/90 text-neutral-800 hover:bg-white',
              ]"
              :aria-label="`Set ${item.name} as cover`"
              @click="emit('setCover', item)"
            >
              <UIcon name="i-heroicons-star-solid" class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/95 text-white shadow-sm backdrop-blur-md transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="busyName === item.name"
              :aria-label="`Delete ${item.name}`"
              @click="emit('delete', item)"
            >
              <UIcon
                :name="busyName === item.name ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'"
                :class="['h-3.5 w-3.5', busyName === item.name && 'animate-spin']"
              />
            </button>
          </div>
        </div>
      </li>
    </VueDraggable>
  </ClientOnly>
</template>

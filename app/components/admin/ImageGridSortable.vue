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
      :animation="180"
      handle=".drag-handle"
      tag="ul"
      item-key="name"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
      @end="onSorted"
    >
      <li
        v-for="(item, idx) in local"
        :key="item.name"
        class="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white"
      >
        <div
          class="aspect-square w-full overflow-hidden bg-neutral-100"
          :style="{
            backgroundColor: `rgb(${item.dominantColor.join(',')})`,
          }"
        >
          <img
            :src="thumb(item.name)"
            :alt="item.name"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div
          class="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white"
        >
          {{ idx + 1 }}
          <span v-if="isCover && isCover(item.name)" class="ml-1">★</span>
        </div>

        <div
          class="drag-handle absolute right-1 top-1 cursor-grab rounded bg-black/50 p-1 text-white active:cursor-grabbing"
          aria-hidden="true"
        >
          <UIcon name="i-heroicons-bars-3" class="h-4 w-4" />
        </div>

        <div
          class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100"
        >
          <div class="flex gap-1">
            <UButton
              size="xs"
              color="neutral"
              variant="solid"
              icon="i-heroicons-arrow-up"
              :aria-label="`Move ${item.name} earlier`"
              :disabled="idx === 0"
              @click="moveUp(idx)"
            />
            <UButton
              size="xs"
              color="neutral"
              variant="solid"
              icon="i-heroicons-arrow-down"
              :aria-label="`Move ${item.name} later`"
              :disabled="idx === local.length - 1"
              @click="moveDown(idx)"
            />
          </div>
          <div class="flex gap-1">
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              icon="i-heroicons-star"
              :aria-label="`Set ${item.name} as cover`"
              @click="emit('setCover', item)"
            />
            <UButton
              size="xs"
              color="error"
              variant="solid"
              icon="i-heroicons-trash"
              :loading="busyName === item.name"
              :aria-label="`Delete ${item.name}`"
              @click="emit('delete', item)"
            />
          </div>
        </div>
      </li>
    </VueDraggable>
  </ClientOnly>
</template>

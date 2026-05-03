<script setup lang="ts">
import type { AlbumMeta } from "~/types";

const props = defineProps<{
  albums: AlbumMeta[];
  loading: boolean;
}>();

const totalAlbumCount = computed(() => props.albums.length)
const promotedCount = computed(() =>
  props.albums.filter(album => album.promoted).length
)
const newestAlbum = computed(() => {
  const sorted = [...props.albums].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return sorted[0] || null
})
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <UCard class="border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Total albums</p>
          <p class="text-3xl font-semibold">{{ totalAlbumCount }}</p>
        </div>
        <UIcon
          name="i-heroicons-rectangle-stack"
          class="text-2xl text-gray-300"
        />
      </div>
      <p class="mt-3 text-xs text-gray-400">
        {{ promotedCount }} promoted ·
        {{ newestAlbum?.title ?? "No recent albums" }} latest
      </p>
    </UCard>

    <UCard class="border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Promoted slots</p>
          <p class="text-3xl font-semibold">{{ promotedCount }}/4</p>
        </div>
        <UIcon name="i-heroicons-star" class="text-2xl text-gray-300" />
      </div>
      <p class="mt-3 text-xs text-gray-400">
        Remaining slots: {{ Math.max(0, 4 - promotedCount) }}
      </p>
    </UCard>

    <UCard class="border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Latest album</p>
          <p class="text-3xl font-semibold">
            {{ newestAlbum?.title ?? "—" }}
          </p>
        </div>
        <UIcon
          name="i-heroicons-information-circle"
          class="text-2xl text-gray-300"
        />
      </div>
      <p class="mt-3 text-xs text-gray-400">
        {{ newestAlbum?.createdAt ? new Date(newestAlbum.createdAt).toLocaleDateString() : "No albums yet" }}
      </p>
    </UCard>
  </div>
</template>

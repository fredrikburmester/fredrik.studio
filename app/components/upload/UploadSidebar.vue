<script setup lang="ts">
import type { AlbumMeta } from "~/types";

const props = defineProps<{
  albums: AlbumMeta[];
  loading: boolean;
  selectedSlug: string | null;
}>();

const emit = defineEmits<{
  (e: "select", slug: string): void;
}>();

const store = useUploadStore()

const sortedAlbums = computed(() => {
  return [...props.albums].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const totalAlbumCount = computed(() => props.albums.length)
const promotedCount = computed(() => 
  props.albums.filter(album => album.promoted).length
)

const handleSelect = (slug: string) => {
  emit("select", slug);
};
</script>

<template>
  <UCard class="h-full border border-gray-200">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Albums</h2>
        <UBadge color="neutral" variant="soft" size="xs">
          {{ sortedAlbums.length }}/{{ totalAlbumCount }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-5">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Albums ({{ sortedAlbums.length }})</span>
        <span>Promoted {{ promotedCount }}/4</span>
      </div>

      <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        <template v-if="loading">
          <USkeleton
            class="h-14 rounded-lg"
            v-for="n in 4"
            :key="`s-${n}`"
          />
        </template>
        
        <template v-else-if="!sortedAlbums.length">
          <UAlert
            color="neutral"
            title="No albums found"
            description="Create a new album to get started"
          />
        </template>

        <template v-else>
          <button
            v-for="album in sortedAlbums"
            :key="album.slug"
            class="w-full"
            @click="handleSelect(album.slug)"
          >
          <div
            class="rounded-lg border p-4 text-left transition-colors"
            :class="[
              album.slug === selectedSlug
                ? 'border-black bg-black/5'
                : 'border-transparent hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center"
              >
                <img
                  v-if="album.coverImage"
                  :src="`${store.blobBaseUrl}/${album.coverImage}`"
                  class="h-full w-full object-cover"
                  alt="Album cover"
                />
                <UIcon v-else name="i-heroicons-photo" class="text-gray-300" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate font-medium">
                    {{ album.title }}
                  </p>
                  <UBadge v-if="album.promoted" size="xs" color="success">
                    Promoted
                  </UBadge>
                </div>
                <p class="truncate text-xs text-gray-500">
                  {{ album.slug }} ·
                  {{ new Date(album.createdAt).toLocaleDateString() }}
                </p>
              </div>
            </div>

            <div
              class="mt-3 flex items-center justify-end text-xs text-gray-500"
            >
              <span
                v-if="selectedSlug === album.slug"
                class="text-black font-medium"
              >
                Active
              </span>
            </div>
          </div>
          </button>
        </template>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { UploadDashboardContext } from "~/composables/useUploadDashboard";

const props = defineProps<{
  context: UploadDashboardContext;
}>();

const emit = defineEmits<{
  (e: "select", slug: string): void;
}>();

const handleSelect = (slug: string) => {
  emit("select", slug);
};
</script>

<template>
  <UCard class="h-full border border-gray-200">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Albums</h2>
        <UBadge color="gray" variant="soft" size="xs">
          {{ context.filteredAlbums?.length || 0 }}/{{
            context.totalAlbumCount
          }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-5">
      <div class="space-y-4">
        <UFormGroup label="Admin password" size="sm">
          <UInput
            v-model="context.password.value"
            type="password"
            autocomplete="current-password"
            placeholder="Enter password"
          />
        </UFormGroup>

        <UInput
          v-model="context.albumSearch.value"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search albums"
          size="sm"
          clearable
        />
      </div>

      <UDivider />

      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Albums ({{ context.filteredAlbums?.length || 0 }})</span>
        <span>Promoted {{ context.promotedCount }}/4</span>
      </div>

      <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        <UAlert
          v-if="
            !context.loadingAlbums.value &&
            (!context.filteredAlbums || context.filteredAlbums.length === 0)
          "
          color="gray"
          title="No matching albums"
          description="Adjust your search or create a new album"
        />

        <USkeleton
          v-if="context.loadingAlbums.value"
          class="h-14 rounded-lg"
          v-for="n in 4"
          :key="`s-${n}`"
        />

        <button
          v-for="album in context.filteredAlbums || []"
          v-show="!context.loadingAlbums.value"
          :key="album.slug"
          class="w-full"
          @click="handleSelect(album.slug)"
        >
          <div
            class="rounded-lg border p-4 text-left transition-colors"
            :class="[
              album.slug === context.selectedSlug
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
                  :src="`${context.blobBaseUrl}/${album.coverImage}`"
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
                  <UBadge v-if="album.promoted" size="xs" color="green">
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
              class="mt-3 flex items-center justify-between text-xs text-gray-500"
            >
              <span>{{ album.imageCount ?? 0 }} images</span>
              <span
                v-if="context.selectedSlug === album.slug"
                class="text-black font-medium"
              >
                Active
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </UCard>
</template>

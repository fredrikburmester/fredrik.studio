<script setup lang="ts">
import type { UploadDashboardContext } from "~/composables/useUploadDashboard";

defineProps<{
  context: UploadDashboardContext;
}>();
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UCard class="border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Total albums</p>
          <p class="text-3xl font-semibold">{{ context.totalAlbumCount }}</p>
        </div>
        <UIcon
          name="i-heroicons-rectangle-stack"
          class="text-2xl text-gray-300"
        />
      </div>
      <p class="mt-3 text-xs text-gray-400">
        {{ context.promotedCount }} promoted ·
        {{ context.newestAlbum?.title ?? "No recent albums" }} latest
      </p>
    </UCard>

    <UCard class="border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Total images</p>
          <p class="text-3xl font-semibold">{{ context.totalImageCount }}</p>
        </div>
        <UIcon name="i-heroicons-photo" class="text-2xl text-gray-300" />
      </div>
      <p class="mt-3 text-xs text-gray-400">
        {{ context.selectedAlbumImagesCount }} in current album
      </p>
    </UCard>

    <UCard class="border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Promoted slots</p>
          <p class="text-3xl font-semibold">{{ context.promotedCount }}/4</p>
        </div>
        <UIcon name="i-heroicons-star" class="text-2xl text-gray-300" />
      </div>
      <p class="mt-3 text-xs text-gray-400">
        Remaining slots: {{ Math.max(0, 4 - context.promotedCount) }}
      </p>
    </UCard>

    <UCard class="border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Active album</p>
          <p class="text-3xl font-semibold">
            {{ context.selectedAlbumMeta?.title ?? "—" }}
          </p>
        </div>
        <UIcon
          name="i-heroicons-information-circle"
          class="text-2xl text-gray-300"
        />
      </div>
      <p class="mt-3 text-xs text-gray-400">
        {{ context.selectedAlbumMeta?.slug ?? "Select an album" }}
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { UploadDashboardContext } from "~/composables/useUploadDashboard";

defineProps<{
  context: UploadDashboardContext;
}>();
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500">
      <span v-if="context.selectedAlbumMeta">
        Selected album created
        {{ new Date(context.selectedAlbumMeta.createdAt).toLocaleDateString() }}
      </span>
      <span v-else>No album selected</span>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <UCheckbox
        v-model="context.layout.compactSidebar"
        label="Compact sidebar"
      />
      <UCheckbox v-model="context.layout.showDetails" label="Show metadata" />
      <UCheckbox v-model="context.layout.showCover" label="Show cover" />
      <UCheckbox v-model="context.layout.showImagesGrid" label="Grid view" />
    </div>
  </div>
</template>

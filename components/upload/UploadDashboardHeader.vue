<script setup lang="ts">
import type { UploadDashboardContext } from "~/composables/useUploadDashboard";

const props = defineProps<{
  context: UploadDashboardContext;
}>();

defineEmits<{
  (e: "refresh"): void;
  (e: "create"): void;
}>();

const isLoading = computed(() => {
  return Boolean(
    props.context.loadingAlbums.value || props.context.loadingAlbumDetails.value
  );
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 class="text-4xl font-semibold">Album Dashboard</h1>
      <p class="text-gray-500">
        Manage Redis-backed albums, update metadata, and control promoted
        content.
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        color="gray"
        variant="outline"
        :loading="isLoading"
        @click="$emit('refresh')"
      >
        <UIcon name="i-heroicons-arrow-path" class="mr-1" />
        Refresh Data
      </UButton>
      <UButton color="black" @click="$emit('create')">
        <UIcon name="i-heroicons-plus" class="mr-1" />
        New Album
      </UButton>
    </div>
  </div>
</template>

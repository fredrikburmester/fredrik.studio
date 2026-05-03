<script setup lang="ts">
import type { AlbumMeta } from "~/types";

const props = defineProps<{
  albums: AlbumMeta[];
  loading: boolean;
}>();

defineEmits<{
  (e: "refresh"): void;
  (e: "create"): void;
}>();
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
        color="neutral"
        variant="outline"
        :loading="loading"
        @click="$emit('refresh')"
      >
        <UIcon name="i-heroicons-arrow-path" class="mr-1" />
        Refresh Data
      </UButton>
      <UButton color="neutral" @click="$emit('create')">
        <UIcon name="i-heroicons-plus" class="mr-1" />
        New Album
      </UButton>
    </div>
  </div>
</template>

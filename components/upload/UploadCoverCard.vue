<script setup lang="ts">
import type { UploadDashboardContext } from "~/composables/useUploadDashboard";

const props = defineProps<{
  context: UploadDashboardContext;
}>();

const emit = defineEmits<{
  (e: "upload"): void;
  (e: "select", files: FileList | null): void;
}>();

const isUploadingCover = computed(() =>
  Boolean(props.context.uploadingCover.value)
);

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  emit("select", target?.files ?? null);
};
</script>

<template>
  <UCard v-if="context.layout.showCover" class="border border-gray-200">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-500 uppercase">Cover image</p>
          <h3 class="text-xl font-semibold">Album hero</h3>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            variant="ghost"
            size="sm"
            color="gray"
            :to="context.blobCoverImage || undefined"
            target="_blank"
            :disabled="!context.blobCoverImage"
          >
            View
          </UButton>
          <UButton
            color="black"
            variant="outline"
            size="sm"
            :loading="isUploadingCover"
            :disabled="isUploadingCover"
            @click="$emit('upload')"
          >
            Upload cover
          </UButton>
        </div>
      </div>
    </template>

    <div class="grid gap-6 md:grid-cols-[240px_1fr]">
      <div>
        <div
          class="aspect-video rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="context.blobCoverImage"
            :src="context.blobCoverImage"
            class="h-full w-full object-cover"
            alt="Album cover"
          />
          <UIcon
            v-else
            name="i-heroicons-photo"
            class="text-4xl text-gray-300"
          />
        </div>
      </div>
      <div class="space-y-4">
        <UFormGroup label="Upload new cover">
          <input
            type="file"
            accept="image/*"
            class="block w-full text-sm"
            @change="onFileChange"
          />
        </UFormGroup>
        <div
          class="rounded-lg border border-dashed border-gray-300 p-4 text-xs text-gray-500"
        >
          <p>
            Recommended: landscape image, minimum width 1600px. The cover is
            shown on the homepage and album listings.
          </p>
          <p v-if="context.coverFile" class="mt-3 text-green-600">
            Selected file: {{ context.coverFile.name }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

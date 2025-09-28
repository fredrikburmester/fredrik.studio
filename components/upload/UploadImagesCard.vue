<script setup lang="ts">
import type { RedisImage } from "~/types/redis";

const props = defineProps<{
  images: RedisImage[];
  imageFiles: File[];
  loadingDetails: boolean;
  uploading: boolean;
  deletingImage: string | null;
  blobBaseUrl: string;
}>();

const emit = defineEmits<{
  (e: "handleFiles", files: FileList | null): void;
  (e: "uploadImages"): void;
  (e: "removeImage", name: string): void;
}>();

const imageInputRef = ref<HTMLInputElement | null>(null);

const triggerInput = () => {
  imageInputRef.value?.click();
};
</script>

<template>
  <UCard class="border border-gray-200">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase text-gray-500 tracking-wide">Images</p>
          <h3 class="text-xl font-semibold">Album assets</h3>
        </div>
        <div class="flex items-center gap-2">
          <UBadge color="gray" variant="soft" size="xs">
            {{ context.albumImages.length }} items
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div
        class="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
        @dragover.prevent
        @drop.prevent="emit('handleFiles', $event.dataTransfer?.files || null)"
        @click="triggerInput"
      >
        <p class="text-gray-500">
          Drag and drop images here, or click to select files.
        </p>
        <input
          ref="imageInputRef"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="
            emit(
              'handleFiles',
              ($event.target as HTMLInputElement)?.files || null
            )
          "
        />
      </div>

      <div
        v-if="imageFiles.length"
        class="rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <p class="text-sm font-medium mb-2">
          Ready to upload ({{ imageFiles.length }})
        </p>
        <ul class="space-y-1 text-xs text-gray-600">
          <li v-for="file in imageFiles" :key="file.name">
            {{ file.name }} · {{ (file.size / 1024 / 1024).toFixed(2) }} MB
          </li>
        </ul>
        <div class="mt-4 flex justify-end">
          <UButton
            color="black"
            :loading="uploading"
            :disabled="uploading"
            @click="emit('uploadImages')"
          >
            Upload queued images
          </UButton>
        </div>
      </div>
    </div>

    <UDivider class="my-6" />

    <div
      v-if="loadingDetails"
      class="flex justify-center py-10"
    >
      <UIcon name="i-heroicons-arrow-path" class="text-2xl animate-spin" />
    </div>

    <div
      v-else-if="!images.length"
      class="py-12 text-center text-gray-500"
    >
      <UIcon name="i-heroicons-photo" class="mb-3 text-3xl" />
      <p>No images in this album yet</p>
    </div>

    <div v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="image in images"
          :key="image.name"
          class="rounded-lg border border-gray-200 overflow-hidden"
        >
          <div class="aspect-video bg-gray-100">
            <img
              :src="`${blobBaseUrl}/${image.paths.thumb}`"
              :alt="image.name"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <p class="font-medium text-sm truncate">{{ image.name }}</p>
              <button
                class="text-xs text-red-500 hover:text-red-600"
                :disabled="deletingImage === image.name"
                @click="emit('removeImage', image.name)"
              >
                {{
                  deletingImage === image.name ? "Removing…" : "Delete"
                }}
              </button>
            </div>
            <p class="text-xs text-gray-500">
              {{ image.width }} × {{ image.height }} ·
              {{ (image.size / 1024 / 1024).toFixed(2) }} MB
            </p>
            <div class="flex items-center gap-2">
              <span
                class="inline-flex h-4 w-4 rounded-full border border-gray-200"
                :style="{
                  backgroundColor: `rgb(${
                    image.dominantColor?.join(',') || '200,200,200'
                  })`,
                }"
              />
              <span class="text-[11px] text-gray-400 truncate">
                {{ image.paths.original }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </UCard>
</template>

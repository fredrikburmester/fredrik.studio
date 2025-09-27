<script setup lang="ts">
import { ref } from "vue";
import type { UploadDashboardContext } from "~/composables/useUploadDashboard";

const props = defineProps<{
  context: UploadDashboardContext;
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

const isUploadingImages = computed(() =>
  Boolean(props.context.uploadingImages.value)
);
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
          <UButtonGroup size="sm" orientation="horizontal">
            <UButton
              :color="context.layout.showImagesGrid ? 'black' : 'gray'"
              variant="outline"
              @click="context.layout.showImagesGrid = true"
            >
              <UIcon name="i-heroicons-squares-2x2" />
            </UButton>
            <UButton
              :color="!context.layout.showImagesGrid ? 'black' : 'gray'"
              variant="outline"
              @click="context.layout.showImagesGrid = false"
            >
              <UIcon name="i-heroicons-list-bullet" />
            </UButton>
          </UButtonGroup>
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
        v-if="context.imageFiles.length"
        class="rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <p class="text-sm font-medium mb-2">
          Ready to upload ({{ context.imageFiles.length }})
        </p>
        <ul class="space-y-1 text-xs text-gray-600">
          <li v-for="file in context.imageFiles" :key="file.name">
            {{ file.name }} · {{ (file.size / 1024 / 1024).toFixed(2) }} MB
          </li>
        </ul>
        <div class="mt-4 flex justify-end">
          <UButton
            color="black"
            :loading="isUploadingImages"
            :disabled="isUploadingImages"
            @click="emit('uploadImages')"
          >
            Upload queued images
          </UButton>
        </div>
      </div>
    </div>

    <UDivider class="my-6" />

    <div
      v-if="context.loadingAlbumDetails.value"
      class="flex justify-center py-10"
    >
      <UIcon name="i-heroicons-arrow-path" class="text-2xl animate-spin" />
    </div>

    <div
      v-else-if="!context.albumImages.length"
      class="py-12 text-center text-gray-500"
    >
      <UIcon name="i-heroicons-photo" class="mb-3 text-3xl" />
      <p>No images in this album yet</p>
    </div>

    <div v-else>
      <div
        v-if="context.layout.showImagesGrid"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="image in context.albumImages"
          :key="image.name"
          class="rounded-lg border border-gray-200 overflow-hidden"
        >
          <div class="aspect-video bg-gray-100">
            <img
              :src="`${context.blobBaseUrl}/albums/${context.selectedSlug}/thumbs/${image.name}`"
              :alt="image.name"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <p class="font-medium text-sm truncate">{{ image.name }}</p>
              <button
                class="text-xs text-red-500 hover:text-red-600"
                :disabled="context.deletingImage === image.name"
                @click="emit('removeImage', image.name)"
              >
                {{
                  context.deletingImage === image.name ? "Removing…" : "Delete"
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

      <div v-else class="space-y-3">
        <div
          v-for="image in context.albumImages"
          :key="image.name"
          class="grid grid-cols-[120px_1fr_auto] gap-4 rounded-lg border border-gray-200 p-3"
        >
          <div class="flex gap-2">
            <div class="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
              <img
                :src="`${context.blobBaseUrl}/albums/${context.selectedSlug}/thumbs/${image.name}`"
                :alt="image.name"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
              <img
                :src="`${context.blobBaseUrl}/albums/${context.selectedSlug}/lqip/${image.name}`"
                :alt="`${image.name} lqip`"
                class="h-full w-full object-cover"
              />
            </div>
          </div>
          <div>
            <p class="font-medium text-sm">{{ image.name }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ image.width }} × {{ image.height }} ·
              {{ (image.size / 1024 / 1024).toFixed(2) }} MB
            </p>
            <div class="mt-2 flex items-center gap-2">
              <span
                class="inline-flex h-4 w-4 rounded-full border border-gray-200"
                :style="{
                  backgroundColor: `rgb(${
                    image.dominantColor?.join(',') || '200,200,200'
                  })`,
                }"
              />
              <code class="text-xs text-gray-400 truncate">
                {{ image.paths.original }}
              </code>
            </div>
          </div>
          <div class="flex items-center">
            <UButton
              color="red"
              variant="ghost"
              size="sm"
              :loading="context.deletingImage === image.name"
              :disabled="context.deletingImage === image.name"
              @click="emit('removeImage', image.name)"
            >
              <UIcon name="i-heroicons-trash" />
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

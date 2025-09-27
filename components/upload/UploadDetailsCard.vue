<script setup lang="ts">
import type { UploadDashboardContext } from "~/composables/useUploadDashboard";

const props = defineProps<{
  context: UploadDashboardContext;
}>();

const emit = defineEmits<{
  (e: "delete"): void;
  (e: "togglePromoted"): void;
  (e: "save"): void;
}>();

const isDeletingAlbum = computed(() =>
  Boolean(props.context.deletingAlbum.value)
);
const isUpdatingPromoted = computed(() =>
  Boolean(props.context.updatingPromoted.value)
);
const isSavingDetails = computed(() =>
  Boolean(props.context.savingDetails.value)
);
</script>

<template>
  <UCard v-if="context.layout.showDetails" class="border border-gray-200">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <p class="text-xs uppercase text-gray-500 tracking-wide">
              Album metadata
            </p>
            <UBadge v-if="context.albumMeta.promoted" size="xs" color="green">
              Promoted
            </UBadge>
          </div>
          <h2 class="text-2xl font-semibold leading-tight">
            {{ context.albumMeta.title }}
          </h2>
          <p class="text-xs text-gray-500">
            Created {{ new Date(context.albumMeta.createdAt).toLocaleString() }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="red"
            variant="outline"
            size="sm"
            :loading="isDeletingAlbum"
            :disabled="isDeletingAlbum"
            @click="$emit('delete')"
          >
            Delete
          </UButton>
          <UButton
            color="green"
            variant="outline"
            size="sm"
            :loading="isUpdatingPromoted"
            :disabled="isUpdatingPromoted"
            @click="$emit('togglePromoted')"
          >
            {{ context.albumMeta.promoted ? "Unpromote" : "Promote" }}
          </UButton>
        </div>
      </div>
    </template>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <UFormGroup label="Title">
          <UInput v-model="context.albumMeta.title" />
        </UFormGroup>
        <UFormGroup label="Slug">
          <UInput :model-value="context.selectedSlug ?? ''" disabled />
        </UFormGroup>
      </div>
      <div>
        <UFormGroup label="Description">
          <UTextarea
            v-model="context.albumMeta.description"
            placeholder="Optional description"
            :rows="4"
          />
        </UFormGroup>
      </div>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-xs uppercase text-gray-400">Images</p>
        <p class="text-xl font-semibold">{{ context.albumMeta.imageCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-xs uppercase text-gray-400">Promoted</p>
        <p class="text-xl font-semibold">
          {{ context.albumMeta.promoted ? "Yes" : "No" }}
        </p>
      </div>
      <div class="rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-xs uppercase text-gray-400">Created</p>
        <p class="text-xl font-semibold">
          {{ new Date(context.albumMeta.createdAt).toLocaleDateString() }}
        </p>
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <UButton
        color="black"
        :loading="isSavingDetails"
        :disabled="isSavingDetails"
        @click="$emit('save')"
      >
        Save changes
      </UButton>
    </div>
  </UCard>
</template>

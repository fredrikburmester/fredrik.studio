<script setup lang="ts">
const props = defineProps<{
  albumMeta: {
    title: string;
    description: string;
    coverImage: string;
    promoted: boolean;
    createdAt: string;
  };
  selectedSlug: string | null;
  loadingDetails: boolean;
  deleting: boolean;
  updatingPromoted: boolean;
  saving: boolean;
}>();

const emit = defineEmits<{
  (e: "delete"): void;
  (e: "togglePromoted"): void;
  (e: "save"): void;
}>();

const store = useUploadStore()
</script>

<template>
  <UCard class="border border-gray-200">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <p class="text-xs uppercase text-gray-500 tracking-wide">
              Album metadata
            </p>
            <UBadge v-if="albumMeta.promoted" size="xs" color="success">
              Promoted
            </UBadge>
          </div>
          <h2 class="text-2xl font-semibold leading-tight">
            {{ albumMeta.title }}
          </h2>
          <p class="text-xs text-gray-500">
            Created {{ albumMeta.createdAt ? new Date(albumMeta.createdAt).toLocaleString() : 'Unknown' }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="error"
            variant="outline"
            size="sm"
            :loading="deleting"
            :disabled="deleting"
            @click="$emit('delete')"
          >
            Delete
          </UButton>
          <UButton
            color="success"
            variant="outline"
            size="sm"
            :loading="updatingPromoted"
            :disabled="updatingPromoted"
            @click="$emit('togglePromoted')"
          >
            {{ albumMeta.promoted ? "Unpromote" : "Promote" }}
          </UButton>
        </div>
      </div>
    </template>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <UFormField label="Title">
          <UInput :model-value="albumMeta.title || ''" @update:model-value="(val) => store.albumMeta.title = val" />
        </UFormField>
        <UFormField label="Slug">
          <UInput :model-value="selectedSlug ?? ''" disabled />
        </UFormField>
      </div>
      <div>
        <UFormField label="Description">
          <UTextarea
            :model-value="albumMeta.description || ''"
            @update:model-value="(val) => store.albumMeta.description = val"
            placeholder="Optional description"
            :rows="4"
          />
        </UFormField>
      </div>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <div class="rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-xs uppercase text-gray-400">Promoted</p>
        <p class="text-xl font-semibold">
          {{ albumMeta.promoted ? "Yes" : "No" }}
        </p>
      </div>
      <div class="rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-xs uppercase text-gray-400">Created</p>
        <p class="text-xl font-semibold">
          {{ albumMeta.createdAt ? new Date(albumMeta.createdAt).toLocaleDateString() : 'Unknown' }}
        </p>
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <UButton
        color="neutral"
        :loading="saving"
        :disabled="saving"
        @click="$emit('save')"
      >
        Save changes
      </UButton>
    </div>
  </UCard>
</template>

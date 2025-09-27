<script setup lang="ts">
import type { UploadDashboardContext } from "~/composables/useUploadDashboard";

const props = defineProps<{
  context: UploadDashboardContext;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "create"): void;
}>();

const isCreatingAlbum = computed(() =>
  Boolean(props.context.creatingAlbum.value)
);
const showModal = computed({
  get: () => Boolean(props.context.showCreateModal.value),
  set: (value: boolean) => {
    props.context.showCreateModal.value = value;
  },
});
</script>

<template>
  <UModal v-model="showModal">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">Create new album</h3>
            <p class="text-sm text-gray-500">
              Provide the details for the new album.
            </p>
          </div>
          <UButton
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="emit('close')"
          />
        </div>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Title" required>
          <UInput
            v-model="props.context.newAlbum.title"
            placeholder="Autumn Wedding"
          />
        </UFormGroup>

        <UFormGroup label="Slug" required>
          <UInput
            v-model="props.context.newAlbum.slug"
            placeholder="autumn-wedding"
          />
        </UFormGroup>

        <UFormGroup label="Description">
          <UTextarea
            v-model="props.context.newAlbum.description"
            :rows="3"
            placeholder="Optional album description"
          />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="emit('close')">Cancel</UButton>
          <UButton
            color="black"
            :loading="isCreatingAlbum"
            @click="emit('create')"
          >
            Create album
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

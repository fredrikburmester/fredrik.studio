<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  newAlbum: {
    title: string;
    slug: string;
    description: string;
  };
  creating: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "create"): void;
  (e: "update:title", value: string): void;
  (e: "update:description", value: string): void;
}>();

const showModal = computed({
  get: () => props.show,
  set: (value: boolean) => {
    if (!value) emit('close');
  },
});
</script>

<template>
  <UModal v-model:open="showModal">
    <template #content>
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
          <UFormField label="Title" required>
            <UInput
              :model-value="newAlbum.title"
              @update:model-value="(val) => emit('update:title', val)"
              placeholder="Autumn Wedding"
            />
          </UFormField>

          <UFormField label="Slug" required>
            <UInput
              :model-value="newAlbum.slug"
              placeholder="autumn-wedding"
              disabled
            />
          </UFormField>

          <UFormField label="Description">
            <UTextarea
              :model-value="newAlbum.description"
              @update:model-value="(val) => emit('update:description', val)"
              :rows="3"
              placeholder="Optional album description"
            />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="emit('close')">Cancel</UButton>
            <UButton
              color="neutral"
              :loading="creating"
              @click="emit('create')"
            >
              Create album
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

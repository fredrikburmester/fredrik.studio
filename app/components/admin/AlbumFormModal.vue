<script setup lang="ts">
import type { AlbumMeta } from "~/types";

type ModelValue = boolean;

const props = defineProps<{
  modelValue: ModelValue;
  album?: AlbumMeta | null;
  submitting?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: ModelValue];
  submit: [
    payload: { title: string; slug?: string; description?: string },
  ];
}>();

const title = ref("");
const slug = ref("");
const description = ref("");

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      title.value = props.album?.title ?? "";
      slug.value = props.album?.slug ?? "";
      description.value = props.album?.description ?? "";
    }
  },
  { immediate: true },
);

const isEdit = computed(() => Boolean(props.album));

const onSubmit = () => {
  if (!title.value.trim()) return;
  emit("submit", {
    title: title.value.trim(),
    slug: isEdit.value ? undefined : slug.value.trim() || undefined,
    description: description.value.trim() || undefined,
  });
};

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <form class="space-y-4 p-6" @submit.prevent="onSubmit">
        <h2 class="text-lg font-semibold">
          {{ isEdit ? "Edit album" : "New album" }}
        </h2>
        <UFormField label="Title" required>
          <UInput v-model="title" autofocus class="w-full" />
        </UFormField>
        <UFormField
          v-if="!isEdit"
          label="Slug (optional)"
          help="URL path. Locked once the album is created."
        >
          <UInput v-model="slug" placeholder="auto from title" class="w-full" />
        </UFormField>
        <UFormField label="Description (optional)">
          <UTextarea v-model="description" :rows="2" class="w-full" />
        </UFormField>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="open = false">
            Cancel
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="submitting"
            :disabled="!title.trim() || submitting"
          >
            {{ isEdit ? "Save" : "Create" }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>

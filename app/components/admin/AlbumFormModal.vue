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
      <form class="space-y-6 p-7" @submit.prevent="onSubmit">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900/5 text-neutral-700">
            <UIcon
              :name="isEdit ? 'i-heroicons-pencil-square' : 'i-heroicons-plus'"
              class="h-5 w-5"
            />
          </div>
          <div class="space-y-0.5">
            <h2 class="text-[18px] font-semibold tracking-tight text-neutral-900">
              {{ isEdit ? "Edit album" : "New album" }}
            </h2>
            <p class="text-[12px] text-neutral-500">
              {{ isEdit ? "Update the album details." : "Create a new collection." }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[12px] font-medium text-neutral-700">
              Title <span class="text-red-500">*</span>
            </label>
            <UInput
              v-model="title"
              autofocus
              size="md"
              placeholder="Untitled"
              class="w-full"
            />
          </div>

          <div v-if="!isEdit" class="space-y-1.5">
            <label class="block text-[12px] font-medium text-neutral-700">
              URL slug
            </label>
            <UInput
              v-model="slug"
              size="md"
              placeholder="auto from title"
              class="w-full"
            />
            <p class="text-[11px] text-neutral-500">
              Locked once the album is created.
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[12px] font-medium text-neutral-700">
              Description
            </label>
            <UTextarea
              v-model="description"
              :rows="3"
              size="md"
              placeholder="Optional · what is this album about?"
              class="w-full"
            />
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <p
            v-if="error"
            class="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-[13px] text-red-700"
          >
            {{ error }}
          </p>
        </Transition>

        <div class="flex justify-end gap-2 border-t border-neutral-900/5 pt-5">
          <button
            type="button"
            class="inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-900/5"
            @click="open = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!title.trim() || submitting"
            class="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-900 px-5 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(0,0,0,0.4)] transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UIcon
              v-if="submitting"
              name="i-heroicons-arrow-path"
              class="h-3.5 w-3.5 animate-spin"
            />
            {{ isEdit ? "Save changes" : "Create album" }}
          </button>
        </div>
      </form>
    </template>
  </UModal>
</template>

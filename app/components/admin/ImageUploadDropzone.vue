<script setup lang="ts">
import { upload } from "@vercel/blob/client";

const BATCH_SIZE = 20;

const props = defineProps<{
  slug: string;
  commit: (
    uploads: { blobUrl: string; originalName: string }[],
  ) => Promise<void>;
}>();

const emit = defineEmits<{
  error: [message: string];
}>();

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const fileInput = ref<HTMLInputElement | null>(null);
const dragActive = ref(false);
const uploading = ref(false);
const phase = ref<"uploading" | "saving" | null>(null);
const progress = ref<{ done: number; total: number }>({ done: 0, total: 0 });

const pickFiles = () => fileInput.value?.click();

const handleFiles = async (files: FileList | File[]) => {
  const list = Array.from(files);
  if (list.length === 0) return;

  const invalid = list.find((f) => !ALLOWED.includes(f.type));
  if (invalid) {
    emit(
      "error",
      `Unsupported file type: ${invalid.name} (JPEG, PNG, or WebP only).`,
    );
    return;
  }

  uploading.value = true;
  progress.value = { done: 0, total: list.length };

  try {
    for (let start = 0; start < list.length; start += BATCH_SIZE) {
      const batch = list.slice(start, start + BATCH_SIZE);
      phase.value = "uploading";
      const results: { blobUrl: string; originalName: string }[] = [];
      for (const file of batch) {
        const target = `albums/${props.slug}/uploads/${Date.now()}-${file.name}`;
        const blob = await upload(target, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload-token",
          contentType: file.type,
        });
        results.push({ blobUrl: blob.url, originalName: file.name });
        progress.value.done += 1;
      }
      phase.value = "saving";
      await props.commit(results);
    }
  } catch (err) {
    emit("error", err instanceof Error ? err.message : "Upload failed");
  } finally {
    uploading.value = false;
    phase.value = null;
  }
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
};

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) handleFiles(target.files);
  target.value = "";
};

const buttonLabel = computed(() => {
  if (!uploading.value) return "Choose files";
  if (phase.value === "saving") {
    return `Saving batch (${progress.value.done}/${progress.value.total})...`;
  }
  return `Uploading ${progress.value.done}/${progress.value.total}...`;
});
</script>

<template>
  <div
    :class="[
      'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
      dragActive
        ? 'border-primary-500 bg-primary-50'
        : 'border-neutral-300 bg-white hover:bg-neutral-50',
    ]"
    @dragenter.prevent="dragActive = true"
    @dragover.prevent="dragActive = true"
    @dragleave.prevent="dragActive = false"
    @drop="onDrop"
  >
    <UIcon
      name="i-heroicons-cloud-arrow-up"
      class="h-8 w-8 text-neutral-400"
    />
    <p class="text-sm text-neutral-700">
      Drag & drop JPEG, PNG, or WebP files here
    </p>
    <p class="text-xs text-neutral-500">Max 50&nbsp;MB each</p>
    <UButton
      color="primary"
      variant="soft"
      :loading="uploading"
      :disabled="uploading"
      @click="pickFiles"
    >
      {{ buttonLabel }}
    </UButton>
    <input
      ref="fileInput"
      type="file"
      :accept="ALLOWED.join(',')"
      multiple
      class="hidden"
      @change="onChange"
    />
  </div>
</template>

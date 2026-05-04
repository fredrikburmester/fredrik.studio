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

const progressPct = computed(() =>
  progress.value.total > 0
    ? Math.round((progress.value.done / progress.value.total) * 100)
    : 0,
);

const phaseLabel = computed(() => {
  if (!uploading.value) return "Drop images or click to browse";
  if (phase.value === "saving") {
    return `Saving ${progress.value.done} of ${progress.value.total}…`;
  }
  return `Uploading ${progress.value.done} of ${progress.value.total}…`;
});
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden rounded-3xl border-2 border-dashed p-8 transition-all duration-200',
      dragActive
        ? 'border-neutral-900 bg-neutral-900/5 scale-[1.005]'
        : 'border-neutral-300/80 bg-white/60 hover:border-neutral-400 hover:bg-white/80',
      uploading && 'pointer-events-none',
    ]"
    @dragenter.prevent="dragActive = true"
    @dragover.prevent="dragActive = true"
    @dragleave.prevent="dragActive = false"
    @drop="onDrop"
  >
    <div class="flex flex-col items-center gap-4 text-center">
      <div
        :class="[
          'flex h-14 w-14 items-center justify-center rounded-2xl transition',
          dragActive
            ? 'bg-neutral-900 text-white scale-110'
            : 'bg-neutral-900/5 text-neutral-700',
        ]"
      >
        <UIcon
          :name="uploading ? 'i-heroicons-arrow-path' : 'i-heroicons-arrow-up-tray'"
          :class="['h-6 w-6', uploading && 'animate-spin']"
        />
      </div>

      <div class="space-y-1">
        <p class="text-[15px] font-semibold tracking-tight text-neutral-900">
          {{ phaseLabel }}
        </p>
        <p class="text-[12px] text-neutral-500">
          JPEG, PNG, or WebP · Up to 50&nbsp;MB each
        </p>
      </div>

      <button
        type="button"
        :disabled="uploading"
        class="inline-flex h-9 items-center gap-2 rounded-full bg-neutral-900 px-5 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(0,0,0,0.4)] transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        @click="pickFiles"
      >
        <UIcon name="i-heroicons-folder-open" class="h-4 w-4" />
        Choose files
      </button>
    </div>

    <!-- Progress bar -->
    <div
      v-if="uploading"
      class="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-neutral-200/80"
    >
      <div
        class="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 transition-[width] duration-300 ease-out"
        :style="{ width: `${progressPct}%` }"
      />
    </div>

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

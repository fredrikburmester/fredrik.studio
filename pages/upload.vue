2<script setup lang="ts">
import UploadDashboardHeader from "~/components/upload/UploadDashboardHeader.vue";
import UploadDashboardMetrics from "~/components/upload/UploadDashboardMetrics.vue";
import UploadLayoutToggles from "~/components/upload/UploadLayoutToggles.vue";
import UploadSidebar from "~/components/upload/UploadSidebar.vue";
import UploadDetailsCard from "~/components/upload/UploadDetailsCard.vue";
import UploadCoverCard from "~/components/upload/UploadCoverCard.vue";
import UploadImagesCard from "~/components/upload/UploadImagesCard.vue";
import UploadCreateModal from "~/components/upload/UploadCreateModal.vue";
import { useUploadDashboard } from "~/composables/useUploadDashboard";

useSeoMeta({
  robots: "noindex, nofollow",
});

const context = useUploadDashboard();

const handleRefresh = () => {
  context.refreshAll();
};

const handleOpenCreateModal = () => {
  context.openCreateModal();
};

const handleCloseCreateModal = () => {
  context.closeCreateModal();
};

const handleCreateAlbum = () => {
  context.createAlbum();
};

const handleSelectAlbum = (slug: string) => {
  context.selectAlbum(slug);
};

const handleCoverSelection = (files: FileList | null) => {
  context.handleCoverSelection(files);
};

const handleUploadCover = () => {
  context.uploadCover();
};

const handleDeleteAlbum = () => {
  context.confirmDeleteAlbum();
};

const handleTogglePromoted = () => {
  context.togglePromoted();
};

const handleSaveDetails = () => {
  context.saveAlbumDetails();
};

const handleImageFiles = (files: FileList | null) => {
  context.handleImageFiles(files);
};

const handleUploadImages = () => {
  context.uploadImages();
};

const handleRemoveImage = (name: string) => {
  context.removeImage(name);
};
</script>

<template>
  <div class="pt-20 pb-12">
    <UContainer class="space-y-8">
      <UploadDashboardHeader
        :context="context"
        @refresh="handleRefresh"
        @create="handleOpenCreateModal"
      />

      <UploadDashboardMetrics :context="context" />

      <UploadLayoutToggles :context="context" />

      <div
        class="grid gap-6 xl:grid-cols-[minmax(320px,360px)_1fr]"
        :class="{ 'xl:grid-cols-[240px_1fr]': context.layout.compactSidebar }"
      >
        <aside class="space-y-4">
          <UploadSidebar :context="context" @select="handleSelectAlbum" />
        </aside>

        <section class="space-y-6">
          <UCard
            v-if="!context.isAlbumSelected"
            class="border border-dashed border-gray-300"
          >
            <div class="py-16 text-center text-gray-500">
              <UIcon name="i-heroicons-arrow-down-tray" class="mb-3 text-3xl" />
              <p>Select an album from the list to begin managing it.</p>
            </div>
          </UCard>

          <template v-else>
            <div
              class="grid gap-6"
              :class="{
                'lg:grid-cols-2':
                  context.layout.showDetails && context.layout.showCover,
              }"
            >
              <UploadDetailsCard
                :context="context"
                @delete="handleDeleteAlbum"
                @toggle-promoted="handleTogglePromoted"
                @save="handleSaveDetails"
              />

              <UploadCoverCard
                :context="context"
                @upload="handleUploadCover"
                @select="handleCoverSelection"
              />
            </div>

            <UploadImagesCard
              :context="context"
              @handle-files="handleImageFiles"
              @upload-images="handleUploadImages"
              @remove-image="handleRemoveImage"
            />
          </template>
        </section>
      </div>
    </UContainer>

    <UploadCreateModal
      :context="context"
      @close="handleCloseCreateModal"
      @create="handleCreateAlbum"
    />
  </div>
</template>

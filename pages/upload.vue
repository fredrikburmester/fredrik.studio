2
<script setup lang="ts">
import UploadDashboardHeader from "~/components/upload/UploadDashboardHeader.vue";
import UploadDashboardMetrics from "~/components/upload/UploadDashboardMetrics.vue";
import UploadSidebar from "~/components/upload/UploadSidebar.vue";
import UploadDetailsCard from "~/components/upload/UploadDetailsCard.vue";
import UploadCoverCard from "~/components/upload/UploadCoverCard.vue";
import UploadImagesCard from "~/components/upload/UploadImagesCard.vue";
import UploadCreateModal from "~/components/upload/UploadCreateModal.vue";
import {
  useAlbumsQuery,
  useAlbumQuery,
  useAlbumImagesQuery,
  useCreateAlbumMutation,
  useUploadImagesMutation,
  useUploadCoverMutation,
  useDeleteImageMutation,
  useTogglePromotedMutation,
  useUpdateAlbumMutation,
  useDeleteAlbumMutation,
} from "~/composables/useAlbumsQuery";

// This page should only render on the client side
definePageMeta({
  ssr: false,
});

useSeoMeta({
  robots: "noindex, nofollow",
});

// Store
const store = useUploadStore();

// Queries
const albumsQuery = useAlbumsQuery();
const albumQuery = useAlbumQuery(() => store.selectedSlug);
const albumImagesQuery = useAlbumImagesQuery(() => store.selectedSlug);

// Mutations
const createAlbumMutation = useCreateAlbumMutation();
const uploadImagesMutation = useUploadImagesMutation();
const uploadCoverMutation = useUploadCoverMutation();
const deleteImageMutation = useDeleteImageMutation();
const togglePromotedMutation = useTogglePromotedMutation();
const updateAlbumMutation = useUpdateAlbumMutation();
const deleteAlbumMutation = useDeleteAlbumMutation();

// Watch for album data changes and update store
watch(
  () => albumQuery.data?.value,
  (albumData) => {
    console.log("Album data changed:", albumData);
    if (albumData) {
      store.setAlbumDetails(albumData);
    }
  },
  { immediate: true }
);

watch(
  () => albumImagesQuery.data?.value,
  (imagesData) => {
    console.log("Album images data changed:", imagesData);
    if (imagesData) {
      store.setAlbumImages(imagesData);
    }
  },
  { immediate: true }
);

// Debug the query states
watch(
  () => store.selectedSlug,
  (newSlug) => {
    console.log("Selected slug changed:", newSlug);
    console.log("Album query enabled:", albumQuery.isEnabled?.value);
    console.log("Album query loading:", albumQuery.isLoading?.value);
  }
);

// Debug query status changes
watch(
  () => albumQuery.isLoading?.value,
  (loading) => {
    console.log("Album query loading changed:", loading);
  }
);

watch(
  () => albumQuery.error?.value,
  (error) => {
    if (error) console.error("Album query error:", error);
  }
);

// Event handlers
const handleRefresh = () => {
  albumsQuery.refetch();
  if (store.selectedSlug) {
    albumQuery.refetch();
    albumImagesQuery.refetch();
  }
};

const handleOpenCreateModal = () => {
  store.openCreateModal();
};

const handleCloseCreateModal = () => {
  store.closeCreateModal();
};

const handleCreateAlbum = async () => {
  if (!store.ensurePassword()) return;
  if (!store.newAlbum.slug || !store.newAlbum.title) {
    useToast().add({
      title: "Missing fields",
      description: "Title and slug are required",
      color: "red",
    });
    return;
  }

  try {
    await createAlbumMutation.mutateAsync({
      password: store.password,
      slug: store.newAlbum.slug,
      title: store.newAlbum.title,
      description: store.newAlbum.description,
    });

    store.closeCreateModal();
    store.selectAlbum(store.newAlbum.slug);
  } catch (error) {
    // Error handled by mutation
  }
};

const handleSelectAlbum = (slug: string) => {
  console.log("Selecting album:", slug);
  store.selectAlbum(slug);
  console.log("Store selectedSlug after selection:", store.selectedSlug);
};

const handleCoverSelection = (files: FileList | null) => {
  store.handleCoverSelection(files);
};

const handleUploadCover = async () => {
  if (!store.ensurePassword()) return;
  if (!store.selectedSlug) return;
  if (!store.coverFile) {
    useToast().add({
      title: "No file",
      description: "Select a cover image first",
      color: "red",
    });
    return;
  }

  try {
    await uploadCoverMutation.mutateAsync({
      slug: store.selectedSlug,
      password: store.password,
      cover: store.coverFile,
    });

    store.coverFile = null;
  } catch (error) {
    // Error handled by mutation
  }
};

const handleDeleteAlbum = async () => {
  if (!store.ensurePassword()) return;
  if (!store.selectedSlug) return;

  try {
    await deleteAlbumMutation.mutateAsync({
      slug: store.selectedSlug,
      password: store.password,
      title: store.albumMeta.title,
    });

    store.clearSelectedAlbum();
  } catch (error) {
    // Error handled by mutation
  }
};

const handleTogglePromoted = async () => {
  if (!store.ensurePassword()) return;
  if (!store.selectedSlug) return;

  const nextPromoted = !store.albumMeta.promoted;

  if (nextPromoted && albumsQuery.data?.value) {
    const promotedCount = albumsQuery.data.value.filter(
      (album) => album.promoted
    ).length;
    if (promotedCount >= 4) {
      useToast().add({
        title: "Limit reached",
        description: "You can only promote up to 4 albums",
        color: "red",
      });
      return;
    }
  }

  try {
    await togglePromotedMutation.mutateAsync({
      slug: store.selectedSlug,
      password: store.password,
      promoted: nextPromoted,
    });
  } catch (error) {
    // Error handled by mutation
  }
};

const handleSaveDetails = async () => {
  if (!store.ensurePassword()) return;
  if (!store.selectedSlug) return;

  try {
    await updateAlbumMutation.mutateAsync({
      slug: store.selectedSlug,
      password: store.password,
      updates: {
        title: store.albumMeta.title,
        description: store.albumMeta.description,
      },
    });
  } catch (error) {
    // Error handled by mutation
  }
};

const handleImageFiles = (files: FileList | null) => {
  store.handleImageFiles(files);
};

const handleUploadImages = async () => {
  if (!store.ensurePassword()) return;
  if (!store.selectedSlug) return;
  if (!store.imageFiles.length) {
    useToast().add({
      title: "No files",
      description: "Select images to upload",
      color: "red",
    });
    return;
  }

  try {
    await uploadImagesMutation.mutateAsync({
      slug: store.selectedSlug,
      password: store.password,
      images: store.imageFiles,
    });

    store.imageFiles = [];
  } catch (error) {
    // Error handled by mutation
  }
};

const handleRemoveImage = async (name: string) => {
  if (!store.ensurePassword()) return;
  if (!store.selectedSlug) return;

  try {
    await deleteImageMutation.mutateAsync({
      slug: store.selectedSlug,
      password: store.password,
      filename: name,
    });
  } catch (error) {
    // Error handled by mutation
  }
};
</script>

<template>
  <div class="pt-20 pb-12">
    <UContainer class="space-y-8">
      <UploadDashboardHeader
        :albums="albumsQuery.data?.value || []"
        :loading="albumsQuery.isLoading?.value || false"
        @refresh="handleRefresh"
        @create="handleOpenCreateModal"
      />

      <UploadDashboardMetrics
        :albums="albumsQuery.data?.value || []"
        :loading="albumsQuery.isLoading?.value || false"
      />

      <div class="grid gap-6 xl:grid-cols-[minmax(320px,360px)_1fr]">
        <aside class="space-y-4">
          <UploadSidebar
            :albums="albumsQuery.data?.value || []"
            :loading="albumsQuery.isLoading?.value || false"
            :selected-slug="store.selectedSlug"
            @select="handleSelectAlbum"
          />
        </aside>

        <section class="space-y-6">
          <UCard
            v-if="!store.isAlbumSelected"
            class="border border-dashed border-gray-300"
          >
            <div class="py-16 text-center text-gray-500">
              <UIcon name="i-heroicons-arrow-down-tray" class="mb-3 text-3xl" />
              <p>Select an album from the list to begin managing it.</p>
            </div>
          </UCard>

          <template v-else>
            <div class="grid gap-6 lg:grid-cols-2">
              <UploadDetailsCard
                :album-meta="store.albumMeta"
                :selected-slug="store.selectedSlug"
                :loading-details="albumQuery.isLoading?.value || false"
                :deleting="deleteAlbumMutation.isPending?.value || false"
                :updating-promoted="
                  togglePromotedMutation.isPending?.value || false
                "
                :saving="updateAlbumMutation.isPending?.value || false"
                @delete="handleDeleteAlbum"
                @toggle-promoted="handleTogglePromoted"
                @save="handleSaveDetails"
              />

              <UploadCoverCard
                :album-meta="store.albumMeta"
                :cover-file="store.coverFile"
                :uploading="uploadCoverMutation.isPending?.value || false"
                :blob-base-url="store.blobBaseUrl"
                @upload="handleUploadCover"
                @select="handleCoverSelection"
              />
            </div>

            <UploadImagesCard
              :images="store.albumImages"
              :image-files="store.imageFiles"
              :loading-details="albumImagesQuery.isLoading?.value || false"
              :uploading="uploadImagesMutation.isPending?.value || false"
              :deleting-image="
                deleteImageMutation.isPending?.value ? 'deleting' : null
              "
              :blob-base-url="store.blobBaseUrl"
              @handle-files="handleImageFiles"
              @upload-images="handleUploadImages"
              @remove-image="handleRemoveImage"
            />
          </template>
        </section>
      </div>
    </UContainer>

    <UploadCreateModal
      :show="store.showCreateModal"
      :new-album="store.newAlbum"
      :creating="createAlbumMutation.isPending?.value || false"
      @close="handleCloseCreateModal"
      @create="handleCreateAlbum"
      @update:title="(val: string) => store.newAlbum.title = val"
      @update:description="(val: string) => store.newAlbum.description = val"
    />

    <!-- Password Prompt Modal -->
    <UModal
      :model-value="store.showPasswordPrompt"
      @update:model-value="store.showPasswordPrompt = $event"
      :prevent-close="true"
    >
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Enter Admin Password</h3>
        </template>

        <form @submit.prevent="store.submitPassword">
          <UFormGroup label="Admin Password" class="mb-4">
            <UInput
              v-model="store.password"
              type="password"
              placeholder="Enter password"
              autocomplete="current-password"
              required
            />
          </UFormGroup>

          <div class="flex justify-end">
            <UButton type="submit" color="black"> Continue </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

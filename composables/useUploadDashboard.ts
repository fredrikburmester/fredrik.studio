import type { AlbumResponse, RedisAlbum, RedisImage } from "~/types/redis";

export interface DashboardLayout {
  compactSidebar: boolean;
  showImagesGrid: boolean;
  showDetails: boolean;
  showCover: boolean;
}

export const uploadDashboardKey = Symbol("upload-dashboard");

export const useUploadDashboard = () => {
  const toast = useToast();
  const { public: runtimePublic } = useRuntimeConfig();
  const blobBaseUrl = runtimePublic.blobBaseUrl;

  const passwordCookie = useCookie<string | null>("admin-password", {
    sameSite: "strict",
    secure: process.dev ? false : true,
    maxAge: 60 * 60 * 12,
  });

  const albumList = ref<AlbumResponse[]>([]);
  const selectedSlug = ref<string | null>(null);
  const password = ref("");
  const loadingAlbums = ref(false);
  const loadingAlbumDetails = ref(false);
  const albumImages = ref<RedisImage[]>([]);
  const albumMeta = reactive({
    title: "",
    description: "",
    coverImage: "",
    promoted: false,
    imageCount: 0,
    createdAt: "",
  });

  const uploadingImages = ref(false);
  const deletingImage = ref<string | null>(null);
  const updatingPromoted = ref(false);
  const savingDetails = ref(false);
  const deletingAlbum = ref(false);
  const uploadingCover = ref(false);

  const imageFiles = ref<File[]>([]);
  const coverFile = ref<File | null>(null);

  const showCreateModal = ref(false);
  const newAlbum = reactive({
    title: "",
    slug: "",
    description: "",
  });
  const creatingAlbum = ref(false);

  const layout = reactive<DashboardLayout>({
    compactSidebar: false,
    showImagesGrid: true,
    showDetails: true,
    showCover: true,
  });

  const albumSearch = ref("");

  if (passwordCookie.value) {
    password.value = passwordCookie.value;
  }

  watch(
    () => newAlbum.title,
    (value) => {
      const clean = value.trim().toLowerCase();
      newAlbum.slug = clean
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
  );

  watch(password, (value) => {
    passwordCookie.value = value || null;
  });

  const totalAlbumCount = computed(() =>
    albumList.value ? albumList.value.length : 0
  );
  const promotedCount = computed(() =>
    albumList.value
      ? albumList.value.filter((album) => album && album.promoted).length
      : 0
  );
  const totalImageCount = computed(() =>
    albumList.value
      ? albumList.value.reduce(
          (sum, album) => sum + (album?.imageCount ?? 0),
          0
        )
      : 0
  );

  const sortedAlbums = computed(() => {
    if (!albumList.value || !Array.isArray(albumList.value)) {
      return [];
    }
    return [...albumList.value]
      .filter((album) => album && album.slug && album.title)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  });

  const filteredAlbums = computed(() => {
    const sorted = sortedAlbums.value;
    if (!Array.isArray(sorted)) {
      return [];
    }
    const query = albumSearch.value.trim().toLowerCase();
    if (!query) return sorted;
    return sorted.filter(
      (album) =>
        album &&
        album.title &&
        album.slug &&
        `${album.title} ${album.slug}`.toLowerCase().includes(query)
    );
  });

  const newestAlbum = computed(() => sortedAlbums.value.at(0) ?? null);

  const selectedAlbumMeta = computed(() =>
    selectedSlug.value && albumList.value
      ? albumList.value.find(
          (album) => album && album.slug === selectedSlug.value
        ) ?? null
      : null
  );

  const selectedAlbumImagesCount = computed(() => albumImages.value.length);

  const refreshAlbumsCache = async () => {
    try {
      const albums = await $fetch<AlbumResponse[]>("/api/albums");
      // Filter out any null/undefined albums and ensure they have required properties
      albumList.value = (albums ?? []).filter(
        (album) =>
          album && typeof album === "object" && album.slug && album.title
      );
    } catch (error) {
      console.warn("Failed to refresh albums cache", error);
      albumList.value = []; // Ensure we have an empty array on error
    }
  };

  const isAlbumSelected = computed(() => Boolean(selectedSlug.value));

  const blobCoverImage = computed(() => {
    if (!albumMeta.coverImage) return "";
    return albumMeta.coverImage.startsWith("http")
      ? albumMeta.coverImage
      : `${blobBaseUrl}/${albumMeta.coverImage}`;
  });

  const ensurePassword = () => {
    if (!password.value) {
      toast.add({
        title: "Password required",
        description: "Enter the admin password to continue",
        color: "red",
      });
      return false;
    }
    passwordCookie.value = password.value;
    return true;
  };

  const loadAlbums = async () => {
    loadingAlbums.value = true;
    try {
      const albums = await $fetch<AlbumResponse[]>("/api/albums");
      // Filter out any null/undefined albums and ensure they have required properties
      albumList.value = (albums ?? []).filter(
        (album) =>
          album && typeof album === "object" && album.slug && album.title
      );

      if (albumList.value.length === 0) {
        selectedSlug.value = null;
        albumImages.value = [];
        return;
      }

      const current = selectedSlug.value;
      if (
        !current ||
        !albumList.value.some((album) => album.slug === current)
      ) {
        selectedSlug.value = albumList.value[0].slug;
      }
    } catch (error) {
      console.error("Failed to load albums", error);
      albumList.value = []; // Ensure we have an empty array on error
      toast.add({
        title: "Load failed",
        description: "Could not load albums",
        color: "red",
      });
    } finally {
      loadingAlbums.value = false;
    }
  };

  const loadAlbumDetails = async (slug: string) => {
    if (!slug) return;
    loadingAlbumDetails.value = true;
    try {
      const [meta, images] = await Promise.all([
        $fetch<RedisAlbum>(`/api/albums/${slug}`),
        $fetch<RedisImage[]>(`/api/albums/${slug}/meta`),
      ]);

      albumMeta.title = meta.title;
      albumMeta.description = meta.description ?? "";
      albumMeta.coverImage = meta.coverImage || "";
      albumMeta.promoted = !!meta.promoted;
      albumMeta.imageCount = meta.imageCount ?? images.length;
      albumMeta.createdAt = meta.createdAt;

      albumImages.value = images ?? [];
    } catch (error) {
      console.error("Failed to load album details", error);
      toast.add({
        title: "Load failed",
        description: "Could not load album details",
        color: "red",
      });
      albumImages.value = [];
    } finally {
      loadingAlbumDetails.value = false;
    }
  };

  const selectAlbum = async (slug: string) => {
    if (!slug) return;
    if (!albumList.value.some((album) => album.slug === slug)) {
      toast.add({
        title: "Album unavailable",
        description: "The requested album could not be found",
        color: "red",
      });
      return;
    }
    if (loadingAlbumDetails.value && slug === selectedSlug.value) return;

    selectedSlug.value = slug;
    await loadAlbumDetails(slug);
  };

  const refreshPromotedCache = async () => {
    try {
      await $fetch("/api/albums/promoted", {
        headers: { "cache-control": "no-cache" },
      });
    } catch (error) {
      console.warn("Failed to refresh promoted cache", error);
    }
  };

  const refreshAll = async () => {
    await loadAlbums();
    if (selectedSlug.value) {
      await loadAlbumDetails(selectedSlug.value);
    }
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (!accepted.length) {
      toast.add({
        title: "Invalid files",
        description: "Only image files are allowed",
        color: "red",
      });
      return;
    }
    imageFiles.value = accepted;
  };

  const uploadImages = async () => {
    if (!ensurePassword()) return;
    if (!selectedSlug.value) return;
    if (!imageFiles.value.length) {
      toast.add({
        title: "No files",
        description: "Select images to upload",
        color: "red",
      });
      return;
    }

    uploadingImages.value = true;

    try {
      const formData = new FormData();
      formData.append("password", password.value);
      formData.append("album", selectedSlug.value);
      imageFiles.value.forEach((file) => {
        formData.append("images", file, file.name);
      });

      await $fetch(`/api/albums/${selectedSlug.value}/upload`, {
        method: "POST",
        body: formData,
      });

      toast.add({
        title: "Upload complete",
        description: "Images added to album",
        color: "green",
      });

      imageFiles.value = [];

      await refreshAll();
    } catch (error) {
      const message =
        (error as { data?: { statusMessage?: string } }).data?.statusMessage ||
        (error instanceof Error ? error.message : "Upload failed");
      toast.add({
        title: "Upload failed",
        description: message,
        color: "red",
      });
    } finally {
      uploadingImages.value = false;
    }
  };

  const removeImage = async (name: string) => {
    if (!ensurePassword()) return;
    if (!selectedSlug.value) return;

    deletingImage.value = name;

    try {
      await $fetch(`/api/albums/${selectedSlug.value}/delete`, {
        method: "DELETE",
        body: {
          password: password.value,
          filename: name,
        },
      });

      toast.add({
        title: "Image deleted",
        description: `${name} was removed`,
        color: "green",
      });

      await refreshAll();
    } catch (error) {
      const message =
        (error as { data?: { statusMessage?: string } }).data?.statusMessage ||
        (error instanceof Error ? error.message : "Delete failed");
      toast.add({
        title: "Delete failed",
        description: message,
        color: "red",
      });
    } finally {
      deletingImage.value = null;
    }
  };

  const togglePromoted = async () => {
    if (!ensurePassword()) return;
    if (!selectedSlug.value) return;

    updatingPromoted.value = true;

    try {
      const count = promotedCount.value;
      const nextPromoted = !albumMeta.promoted;

      if (nextPromoted && count >= 4) {
        toast.add({
          title: "Limit reached",
          description: "You can only promote up to 4 albums",
          color: "red",
        });
        updatingPromoted.value = false;
        return;
      }

      await $fetch(`/api/albums/${selectedSlug.value}/promote`, {
        method: "POST",
        body: {
          password: password.value,
          promoted: nextPromoted,
        },
      });

      toast.add({
        title: nextPromoted ? "Album promoted" : "Album unpromoted",
        description: `${albumMeta.title} has been ${
          nextPromoted ? "added to" : "removed from"
        } promoted albums`,
        color: "green",
      });

      await refreshAll();
      await refreshPromotedCache();
    } catch (error) {
      const message =
        (error as { data?: { statusMessage?: string } }).data?.statusMessage ||
        (error instanceof Error ? error.message : "Update failed");
      toast.add({
        title: "Update failed",
        description: message,
        color: "red",
      });
    } finally {
      updatingPromoted.value = false;
    }
  };

  const saveAlbumDetails = async () => {
    if (!ensurePassword()) return;
    if (!selectedSlug.value) return;

    savingDetails.value = true;

    try {
      await $fetch(`/api/albums/${selectedSlug.value}/album`, {
        method: "PATCH",
        body: {
          password: password.value,
          updates: {
            title: albumMeta.title,
            description: albumMeta.description,
          },
        },
      });

      toast.add({
        title: "Album updated",
        description: "Details saved",
        color: "green",
      });

      await refreshAll();
    } catch (error) {
      const message =
        (error as { data?: { statusMessage?: string } }).data?.statusMessage ||
        (error instanceof Error ? error.message : "Save failed");
      toast.add({
        title: "Save failed",
        description: message,
        color: "red",
      });
    } finally {
      savingDetails.value = false;
    }
  };

  const handleCoverSelection = (files: FileList | null) => {
    if (!files || !files.length) {
      coverFile.value = null;
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Invalid file",
        description: "Cover image must be an image file",
        color: "red",
      });
      return;
    }

    coverFile.value = file;
  };

  const uploadCover = async () => {
    if (!ensurePassword()) return;
    if (!selectedSlug.value) return;
    if (!coverFile.value) {
      toast.add({
        title: "No file",
        description: "Select a cover image first",
        color: "red",
      });
      return;
    }

    uploadingCover.value = true;

    try {
      const formData = new FormData();
      formData.append("password", password.value);
      formData.append("cover", coverFile.value);

      await $fetch(`/api/albums/${selectedSlug.value}/cover`, {
        method: "POST",
        body: formData,
      });

      toast.add({
        title: "Cover updated",
        description: "Album cover image updated",
        color: "green",
      });

      coverFile.value = null;

      await refreshAll();
      await refreshPromotedCache();
    } catch (error) {
      const message =
        (error as { data?: { statusMessage?: string } }).data?.statusMessage ||
        (error instanceof Error ? error.message : "Upload failed");
      toast.add({
        title: "Upload failed",
        description: message,
        color: "red",
      });
    } finally {
      uploadingCover.value = false;
    }
  };

  const confirmDeleteAlbum = async () => {
    if (!ensurePassword()) return;
    if (!selectedSlug.value) return;

    if (
      !confirm(
        `Delete album "${albumMeta.title}"? This removes all images permanently.`
      )
    ) {
      return;
    }

    deletingAlbum.value = true;

    try {
      await $fetch(`/api/albums/${selectedSlug.value}/album`, {
        method: "DELETE",
        body: {
          password: password.value,
        },
      });

      toast.add({
        title: "Album deleted",
        description: `${albumMeta.title} removed`,
        color: "green",
      });

      selectedSlug.value = null;
      albumImages.value = [];

      await refreshAll();
      await refreshPromotedCache();
    } catch (error) {
      const message =
        (error as { data?: { statusMessage?: string } }).data?.statusMessage ||
        (error instanceof Error ? error.message : "Delete failed");
      toast.add({
        title: "Delete failed",
        description: message,
        color: "red",
      });
    } finally {
      deletingAlbum.value = false;
    }
  };

  const openCreateModal = () => {
    newAlbum.title = "";
    newAlbum.slug = "";
    newAlbum.description = "";
    showCreateModal.value = true;
  };

  const closeCreateModal = () => {
    showCreateModal.value = false;
  };

  const createAlbum = async () => {
    if (!ensurePassword()) return;
    if (!newAlbum.slug || !newAlbum.title) {
      toast.add({
        title: "Missing fields",
        description: "Title and slug are required",
        color: "red",
      });
      return;
    }

    creatingAlbum.value = true;

    try {
      const targetSlug = newAlbum.slug;

      await $fetch("/api/albums", {
        method: "POST",
        body: {
          password: password.value,
          slug: targetSlug,
          title: newAlbum.title,
          description: newAlbum.description,
        },
      });

      toast.add({
        title: "Album created",
        description: `${newAlbum.title} added`,
        color: "green",
      });

      closeCreateModal();

      await refreshAll();
      await selectAlbum(targetSlug);
    } catch (error) {
      const message =
        (error as { data?: { statusMessage?: string } }).data?.statusMessage ||
        (error instanceof Error ? error.message : "Create failed");
      toast.add({
        title: "Create failed",
        description: message,
        color: "red",
      });
    } finally {
      creatingAlbum.value = false;
    }
  };

  onMounted(async () => {
    await loadAlbums();
    if (selectedSlug.value) {
      await loadAlbumDetails(selectedSlug.value);
    }
  });

  return {
    // state
    passwordCookie,
    albumList,
    selectedSlug,
    password,
    loadingAlbums,
    loadingAlbumDetails,
    albumImages,
    albumMeta,
    uploadingImages,
    deletingImage,
    updatingPromoted,
    savingDetails,
    deletingAlbum,
    uploadingCover,
    imageFiles,
    coverFile,
    showCreateModal,
    newAlbum,
    creatingAlbum,
    layout,
    albumSearch,

    // computed
    totalAlbumCount,
    promotedCount,
    totalImageCount,
    sortedAlbums,
    filteredAlbums,
    newestAlbum,
    selectedAlbumMeta,
    selectedAlbumImagesCount,
    isAlbumSelected,
    blobCoverImage,
    blobBaseUrl,

    // actions
    ensurePassword,
    loadAlbums,
    loadAlbumDetails,
    selectAlbum,
    refreshPromotedCache,
    refreshAll,
    handleImageFiles,
    uploadImages,
    removeImage,
    togglePromoted,
    saveAlbumDetails,
    handleCoverSelection,
    uploadCover,
    confirmDeleteAlbum,
    openCreateModal,
    closeCreateModal,
    createAlbum,
  };
};

export type UploadDashboardContext = ReturnType<typeof useUploadDashboard>;

export const useUploadDashboardContext = () => {
  const context = inject<UploadDashboardContext>(uploadDashboardKey);
  if (!context) {
    throw new Error("Upload dashboard context not provided");
  }
  return context;
};

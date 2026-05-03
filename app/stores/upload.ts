import { defineStore } from "pinia";
import type { AlbumMeta, ReturnItem } from "../../types";

export const useUploadStore = defineStore("upload", () => {
  // Runtime config
  const { public: runtimePublic } = useRuntimeConfig();
  const toast = useToast();

  // Auth state
  const password = ref("");
  const showPasswordPrompt = ref(false);
  const passwordCookie = useCookie<string | null>("admin-password", {
    sameSite: "strict",
    secure: process.dev ? false : true,
    maxAge: 60 * 60 * 12,
  });

  // Selected album state
  const selectedSlug = ref<string | null>(null);
  const albumMeta = reactive({
    title: "",
    description: "",
    coverImage: "",
    promoted: false,
    createdAt: "",
  });
  const albumImages = ref<ReturnItem[]>([]);

  // File upload state
  const imageFiles = ref<File[]>([]);
  const coverFile = ref<File | null>(null);

  // Create modal state
  const showCreateModal = ref(false);
  const newAlbum = reactive({
    title: "",
    slug: "",
    description: "",
  });

  // Loading states
  const uploadingImages = ref(false);
  const deletingImage = ref<string | null>(null);
  const updatingPromoted = ref(false);
  const savingDetails = ref(false);
  const deletingAlbum = ref(false);
  const uploadingCover = ref(false);
  const creatingAlbum = ref(false);

  // Initialize auth
  if (process.client) {
    if (passwordCookie.value) {
      password.value = passwordCookie.value;
    } else {
      showPasswordPrompt.value = true;
    }
  }

  // Auto-generate slug from title
  watch(
    () => newAlbum.title,
    (value) => {
      const clean = value.trim().toLowerCase();
      newAlbum.slug = clean
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
  );

  // Sync password with cookie
  watch(password, (value) => {
    passwordCookie.value = value || null;
  });

  // Computed properties
  const blobBaseUrl = computed(() => runtimePublic.blobBaseUrl);

  const blobCoverImage = computed(() => {
    if (!albumMeta.coverImage) return "";
    return albumMeta.coverImage.startsWith("http")
      ? albumMeta.coverImage
      : `${blobBaseUrl.value}/${albumMeta.coverImage}`;
  });

  const isAlbumSelected = computed(() => Boolean(selectedSlug.value));

  // Auth actions
  const submitPassword = () => {
    if (!password.value) {
      toast.add({
        title: "Password required",
        description: "Enter the admin password to continue",
        color: "error",
      });
      return;
    }
    passwordCookie.value = password.value;
    showPasswordPrompt.value = false;
  };

  const ensurePassword = () => {
    if (!password.value) {
      toast.add({
        title: "Password required",
        description: "Enter the admin password to continue",
        color: "error",
      });
      return false;
    }
    passwordCookie.value = password.value;
    return true;
  };

  // Album selection
  const selectAlbum = (slug: string) => {
    selectedSlug.value = slug;
  };

  // File handling
  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (!accepted.length) {
      toast.add({
        title: "Invalid files",
        description: "Only image files are allowed",
        color: "error",
      });
      return;
    }
    imageFiles.value = accepted;
  };

  const handleCoverSelection = (files: FileList | null) => {
    if (!files || !files.length) {
      coverFile.value = null;
      return;
    }

    const file = files[0]!;
    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Invalid file",
        description: "Cover image must be an image file",
        color: "error",
      });
      return;
    }

    coverFile.value = file;
  };

  // Modal actions
  const openCreateModal = () => {
    newAlbum.title = "";
    newAlbum.slug = "";
    newAlbum.description = "";
    showCreateModal.value = true;
  };

  const closeCreateModal = () => {
    showCreateModal.value = false;
  };

  // Clear selected album state
  const clearSelectedAlbum = () => {
    selectedSlug.value = null;
    albumImages.value = [];
    Object.assign(albumMeta, {
      title: "",
      description: "",
      coverImage: "",
      promoted: false,
      createdAt: "",
    });
  };

  // Set album details
  const setAlbumDetails = (album: AlbumMeta) => {
    albumMeta.title = album.title;
    albumMeta.description = album.description ?? "";
    albumMeta.coverImage = album.coverImage || "";
    albumMeta.promoted = !!album.promoted;
    albumMeta.createdAt = album.createdAt;
  };

  const setAlbumImages = (images: ReturnItem[]) => {
    albumImages.value = images ?? [];
  };

  return {
    // State
    password,
    showPasswordPrompt,
    selectedSlug,
    albumMeta,
    albumImages,
    imageFiles,
    coverFile,
    showCreateModal,
    newAlbum,
    uploadingImages,
    deletingImage,
    updatingPromoted,
    savingDetails,
    deletingAlbum,
    uploadingCover,
    creatingAlbum,

    // Computed
    blobBaseUrl,
    blobCoverImage,
    isAlbumSelected,

    // Actions
    submitPassword,
    ensurePassword,
    selectAlbum,
    handleImageFiles,
    handleCoverSelection,
    openCreateModal,
    closeCreateModal,
    clearSelectedAlbum,
    setAlbumDetails,
    setAlbumImages,
  };
});

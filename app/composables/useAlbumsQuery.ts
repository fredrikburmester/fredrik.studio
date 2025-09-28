import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { AlbumResponse, RedisAlbum, RedisImage } from "~/types/redis";

// Albums list query
export const useAlbumsQuery = () => {
  if (process.server) {
    // Return a mock query object for server-side rendering
    return {
      data: ref(null),
      isLoading: ref(false),
      error: ref(null),
      refetch: () => Promise.resolve(),
    };
  }

  return useQuery({
    queryKey: ["albums"],
    queryFn: async (): Promise<AlbumResponse[]> => {
      return await $fetch("/api/albums");
    },
  });
};

// Single album query
export const useAlbumQuery = (slug: MaybeRefOrGetter<string | null>) => {
  if (process.server) {
    // Return a mock query object for server-side rendering
    return {
      data: ref(null),
      isLoading: ref(false),
      error: ref(null),
      isEnabled: ref(false),
      refetch: () => Promise.resolve(),
    };
  }

  return useQuery({
    queryKey: computed(() => ["album", toValue(slug)]),
    queryFn: async (): Promise<RedisAlbum> => {
      const albumSlug = toValue(slug);
      if (!albumSlug) throw new Error("No album slug provided");
      return await $fetch(`/api/albums/${albumSlug}/album`);
    },
    enabled: computed(() => !!toValue(slug)),
  });
};

// Album images query
export const useAlbumImagesQuery = (slug: MaybeRefOrGetter<string | null>) => {
  if (process.server) {
    // Return a mock query object for server-side rendering
    return {
      data: ref(null),
      isLoading: ref(false),
      error: ref(null),
      isEnabled: ref(false),
      refetch: () => Promise.resolve(),
    };
  }

  return useQuery({
    queryKey: computed(() => ["album-images", toValue(slug)]),
    queryFn: async (): Promise<RedisImage[]> => {
      const albumSlug = toValue(slug);
      if (!albumSlug) throw new Error("No album slug provided");
      return await $fetch(`/api/albums/${albumSlug}/meta`);
    },
    enabled: computed(() => !!toValue(slug)),
  });
};

// Create album mutation
export const useCreateAlbumMutation = () => {
  if (process.server) {
    // Return a mock mutation object for server-side rendering
    return {
      mutateAsync: () => Promise.resolve(),
      isPending: ref(false),
    };
  }

  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: {
      password: string;
      slug: string;
      title: string;
      description: string;
    }) => {
      return await $fetch("/api/albums", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (data, variables) => {
      toast.add({
        title: "Album created",
        description: `${variables.title} added`,
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (error: any) => {
      const message =
        error.data?.statusMessage || error.message || "Create failed";
      toast.add({
        title: "Create failed",
        description: message,
        color: "red",
      });
    },
  });
};

// Upload images mutation
export const useUploadImagesMutation = () => {
  if (process.server) {
    // Return a mock mutation object for server-side rendering
    return {
      mutateAsync: () => Promise.resolve(),
      isPending: ref(false),
    };
  }

  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: {
      slug: string;
      password: string;
      images: File[];
    }) => {
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("album", data.slug);
      data.images.forEach((file) => {
        formData.append("images", file, file.name);
      });

      return await $fetch(`/api/albums/${data.slug}/upload`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (data, variables) => {
      toast.add({
        title: "Upload complete",
        description: "Images added to album",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["album", variables.slug] });
      queryClient.invalidateQueries({
        queryKey: ["album-images", variables.slug],
      });
    },
    onError: (error: any) => {
      const message =
        error.data?.statusMessage || error.message || "Upload failed";
      toast.add({
        title: "Upload failed",
        description: message,
        color: "red",
      });
    },
  });
};

// Upload cover mutation
export const useUploadCoverMutation = () => {
  if (process.server) {
    // Return a mock mutation object for server-side rendering
    return {
      mutateAsync: () => Promise.resolve(),
      isPending: ref(false),
    };
  }

  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: {
      slug: string;
      password: string;
      cover: File;
    }) => {
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("cover", data.cover);

      return await $fetch(`/api/albums/${data.slug}/cover`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (data, variables) => {
      toast.add({
        title: "Cover updated",
        description: "Album cover image updated",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["album", variables.slug] });
    },
    onError: (error: any) => {
      const message =
        error.data?.statusMessage || error.message || "Upload failed";
      toast.add({
        title: "Upload failed",
        description: message,
        color: "red",
      });
    },
  });
};

// Delete image mutation
export const useDeleteImageMutation = () => {
  if (process.server) {
    // Return a mock mutation object for server-side rendering
    return {
      mutateAsync: () => Promise.resolve(),
      isPending: ref(false),
    };
  }

  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: {
      slug: string;
      password: string;
      filename: string;
    }) => {
      return await $fetch(`/api/albums/${data.slug}/delete`, {
        method: "DELETE",
        body: {
          password: data.password,
          filename: data.filename,
        },
      });
    },
    onSuccess: (data, variables) => {
      toast.add({
        title: "Image deleted",
        description: `${variables.filename} was removed`,
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["album", variables.slug] });
      queryClient.invalidateQueries({
        queryKey: ["album-images", variables.slug],
      });
    },
    onError: (error: any) => {
      const message =
        error.data?.statusMessage || error.message || "Delete failed";
      toast.add({
        title: "Delete failed",
        description: message,
        color: "red",
      });
    },
  });
};

// Toggle promoted mutation
export const useTogglePromotedMutation = () => {
  if (process.server) {
    // Return a mock mutation object for server-side rendering
    return {
      mutateAsync: () => Promise.resolve(),
      isPending: ref(false),
    };
  }

  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: {
      slug: string;
      password: string;
      promoted: boolean;
    }) => {
      return await $fetch(`/api/albums/${data.slug}/promote`, {
        method: "POST",
        body: {
          password: data.password,
          promoted: data.promoted,
        },
      });
    },
    onSuccess: (data, variables) => {
      toast.add({
        title: variables.promoted ? "Album promoted" : "Album unpromoted",
        description: `Album has been ${
          variables.promoted ? "added to" : "removed from"
        } promoted albums`,
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["album", variables.slug] });
    },
    onError: (error: any) => {
      const message =
        error.data?.statusMessage || error.message || "Update failed";
      toast.add({
        title: "Update failed",
        description: message,
        color: "red",
      });
    },
  });
};

// Update album details mutation
export const useUpdateAlbumMutation = () => {
  if (process.server) {
    // Return a mock mutation object for server-side rendering
    return {
      mutateAsync: () => Promise.resolve(),
      isPending: ref(false),
    };
  }

  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: {
      slug: string;
      password: string;
      updates: {
        title: string;
        description: string;
      };
    }) => {
      return await $fetch(`/api/albums/${data.slug}/album`, {
        method: "PATCH",
        body: {
          password: data.password,
          updates: data.updates,
        },
      });
    },
    onSuccess: (data, variables) => {
      toast.add({
        title: "Album updated",
        description: "Details saved",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["album", variables.slug] });
    },
    onError: (error: any) => {
      const message =
        error.data?.statusMessage || error.message || "Save failed";
      toast.add({
        title: "Save failed",
        description: message,
        color: "red",
      });
    },
  });
};

// Delete album mutation
export const useDeleteAlbumMutation = () => {
  if (process.server) {
    // Return a mock mutation object for server-side rendering
    return {
      mutateAsync: () => Promise.resolve(),
      isPending: ref(false),
    };
  }

  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: {
      slug: string;
      password: string;
      title: string;
    }) => {
      const confirmed = confirm(
        `Delete album "${data.title}"? This removes all images permanently.`
      );
      if (!confirmed) throw new Error("Delete cancelled");

      return await $fetch(`/api/albums/${data.slug}/album`, {
        method: "DELETE",
        body: {
          password: data.password,
        },
      });
    },
    onSuccess: (data, variables) => {
      toast.add({
        title: "Album deleted",
        description: `${variables.title} removed`,
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (error: any) => {
      if (error.message === "Delete cancelled") return;
      const message =
        error.data?.statusMessage || error.message || "Delete failed";
      toast.add({
        title: "Delete failed",
        description: message,
        color: "red",
      });
    },
  });
};

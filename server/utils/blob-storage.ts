import { put, list } from "@vercel/blob";
import { createError } from "#imports";
import type { AlbumCollection, AlbumMeta, ReturnType } from "~/types";

const ALBUMS_METADATA_PREFIX = "metadata/albums";
const CURRENT_VERSION_FILE = "metadata/current-albums-version.json";

/**
 * Helper function to store data in blob storage with versioned filename
 */
const storeVersionedData = async <T>(
  prefix: string,
  data: T
): Promise<string> => {
  const timestamp = Date.now();
  const versionId = Math.random().toString(36).substring(7);
  const versionedPath = `${prefix}-${timestamp}-${versionId}.json`;

  try {
    const jsonData = JSON.stringify(data, null, 2);
    await put(versionedPath, jsonData, {
      access: "public",
      contentType: "application/json",
    });
    return versionedPath;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to store versioned data:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to store versioned data: ${errorMessage}`,
    });
  }
};

/**
 * Get current version info from version file with cache busting
 */
const getCurrentVersionInfo = async (): Promise<{
  path: string;
  timestamp: number;
} | null> => {
  try {
    // Try to get version file with aggressive cache busting
    const { blobs } = await list({ prefix: CURRENT_VERSION_FILE });
    const versionBlob = blobs.find((b) => b.pathname === CURRENT_VERSION_FILE);

    if (!versionBlob) {
      console.log("No version file found");
      return null;
    }

    // Cache bust the version file fetch
    const cacheBuster = `?v=${Date.now()}&r=${Math.random()}`;
    const response = await fetch(versionBlob.url + cacheBuster, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch version info: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get current version:", error);
    return null;
  }
};

export const getAlbumsFromBlobStorage = async (): Promise<AlbumCollection> => {
  try {
    // First try to get the current version from the pointer file
    const versionInfo = await getCurrentVersionInfo();

    if (versionInfo) {
      console.log(`Loading albums from versioned file: ${versionInfo.path}`);
      // Fetch directly by known path (no listing needed)
      const response = await fetch(
        `https://cqd6ktki9lxhwj73.public.blob.vercel-storage.com/${versionInfo.path}`
      );

      if (response.ok) {
        const albums = await response.json();
        console.log(`Loaded ${albums.length} albums from version pointer`);
        return albums;
      }
    }

    // Fallback: use list method (might be cached but better than nothing)
    console.log("Version pointer failed, falling back to list method");
    const { blobs } = await list({ prefix: ALBUMS_METADATA_PREFIX });

    const metadataFiles = blobs
      .filter(
        (blob) =>
          blob.pathname.startsWith(ALBUMS_METADATA_PREFIX) &&
          blob.pathname.endsWith(".json")
      )
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

    if (metadataFiles.length === 0) {
      console.log("No albums metadata found");
      return [];
    }

    const latestFile = metadataFiles[0];
    const response = await fetch(latestFile.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.status}`);
    }

    const albums = await response.json();
    console.log(`Loaded ${albums.length} albums from fallback list method`);
    return albums;
  } catch (error) {
    console.error("Failed to get albums:", error);
    return [];
  }
};

/**
 * Get promoted albums from blob storage (max 4)
 */
export const getPromotedAlbumsFromBlobStorage =
  async (): Promise<AlbumCollection> => {
    const albums = await getAlbumsFromBlobStorage();
    return albums.filter((album) => album.promoted).slice(0, 4);
  };

/**
 * Store albums collection in blob storage with versioned filename and update pointer
 */
export const upsertAlbumsInBlobStorage = async (
  albums: AlbumCollection
): Promise<void> => {
  console.log(`Storing ${albums.length} albums with versioned filename`);

  // Store the actual data in versioned file
  const versionedPath = await storeVersionedData(
    ALBUMS_METADATA_PREFIX,
    albums
  );

  // Update the version pointer file to point to latest version
  const versionInfo = {
    path: versionedPath,
    timestamp: Date.now(),
    albumCount: albums.length,
  };

  // Store version pointer (this will be cached, but we cache-bust when reading it)
  const versionData = JSON.stringify(versionInfo, null, 2);
  await put(CURRENT_VERSION_FILE, versionData, {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });

  console.log(
    `Successfully stored albums to ${versionedPath} and updated version pointer`
  );
};

/**
 * Get album metadata from blob storage
 */
export const getAlbumMetaFromBlobStorage = async (
  slug: string
): Promise<ReturnType> => {
  try {
    const { blobs } = await list({ prefix: `metadata/albums/${slug}` });

    const metadataFiles = blobs
      .filter(
        (blob) =>
          blob.pathname.includes(slug) && blob.pathname.endsWith(".json")
      )
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

    if (metadataFiles.length === 0) {
      console.log(`No metadata found for album ${slug}`);
      return [];
    }

    const latestFile = metadataFiles[0];
    const response = await fetch(latestFile.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch album metadata: ${response.status}`);
    }

    const images = await response.json();
    console.log(`Loaded ${images.length} images for album ${slug}`);
    return images;
  } catch (error) {
    console.error(`Failed to get metadata for album ${slug}:`, error);
    return [];
  }
};

/**
 * Store album metadata in blob storage with versioned filename
 */
export const upsertAlbumMetaInBlobStorage = async (
  slug: string,
  images: ReturnType
): Promise<void> => {
  console.log(
    `Storing metadata for album ${slug} with ${images.length} images`
  );
  const versionedPath = await storeVersionedData(
    `metadata/albums/${slug}`,
    images
  );
  console.log(`Successfully stored album metadata to ${versionedPath}`);
};

/**
 * Ensure album exists in the albums collection
 */
export const ensureAlbumExistsInBlobStorage = async (
  album: AlbumMeta
): Promise<void> => {
  const albums = await getAlbumsFromBlobStorage();
  const exists = albums.find((item) => item.slug === album.slug);

  if (exists) {
    return;
  }

  const updated = [...albums, album];
  await upsertAlbumsInBlobStorage(updated);
};

/**
 * Find a specific album in blob storage
 */
export const findAlbumInBlobStorage = async (
  slug: string
): Promise<AlbumMeta | undefined> => {
  const albums = await getAlbumsFromBlobStorage();
  return albums.find((album) => album.slug === slug);
};

/**
 * Update or create an album in the collection
 */
export const upsertAlbumInBlobStorage = async (album: AlbumMeta) => {
  const albums = await getAlbumsFromBlobStorage();
  const index = albums.findIndex((item) => item.slug === album.slug);

  if (index === -1) {
    await upsertAlbumsInBlobStorage([...albums, album]);
    return;
  }

  const updated = [...albums];
  updated[index] = { ...updated[index], ...album };
  await upsertAlbumsInBlobStorage(updated);
};

/**
 * Ensure album has a cover image set
 */
export const ensureAlbumCover = async (slug: string, coverImage: string) => {
  const albums = await getAlbumsFromBlobStorage();
  const index = albums.findIndex((album) => album.slug === slug);

  if (index === -1) {
    return;
  }

  const album = albums[index];
  if (album.coverImage) {
    return;
  }

  const updated = [...albums];
  updated[index] = { ...album, coverImage };
  await upsertAlbumsInBlobStorage(updated);
};

/**
 * Promote an album (max 4 promoted enforced)
 */
export const promoteAlbumInBlobStorage = async (
  slug: string
): Promise<boolean> => {
  const albums = await getAlbumsFromBlobStorage();
  const index = albums.findIndex((album) => album.slug === slug);

  if (index === -1) {
    console.log(`Cannot promote: album ${slug} not found`);
    return false;
  }

  const target = albums[index];
  const promotedCount = albums.filter((album) => album.promoted).length;

  if (promotedCount >= 4 && !target.promoted) {
    console.log(
      `Cannot promote ${slug}: already at max of 4 promoted albums`
    );
    return false;
  }

  const updated = [...albums];
  updated[index] = { ...target, promoted: true };
  await upsertAlbumsInBlobStorage(updated);
  console.log(`Successfully promoted album ${slug}`);
  return true;
};

/**
 * Unpromote an album (no-op if missing)
 */
export const unpromoteAlbumInBlobStorage = async (
  slug: string
): Promise<void> => {
  const albums = await getAlbumsFromBlobStorage();
  const index = albums.findIndex((album) => album.slug === slug);

  if (index === -1) {
    console.log(`Cannot unpromote: album ${slug} not found`);
    return;
  }

  const updated = [...albums];
  updated[index] = { ...updated[index], promoted: false };
  await upsertAlbumsInBlobStorage(updated);
  console.log(`Successfully unpromoted album ${slug}`);
};

/**
 * Update album fields (only defined fields are merged)
 */
export const updateAlbumInBlobStorage = async (
  slug: string,
  updates: Partial<
    Pick<AlbumMeta, "title" | "description" | "coverImage" | "promoted">
  >
): Promise<AlbumMeta | null> => {
  const albums = await getAlbumsFromBlobStorage();
  const index = albums.findIndex((album) => album.slug === slug);

  if (index === -1) {
    console.log(`Cannot update: album ${slug} not found`);
    return null;
  }

  const definedUpdates: Partial<AlbumMeta> = {};
  if (updates.title !== undefined) definedUpdates.title = updates.title;
  if (updates.description !== undefined)
    definedUpdates.description = updates.description;
  if (updates.coverImage !== undefined)
    definedUpdates.coverImage = updates.coverImage;
  if (updates.promoted !== undefined)
    definedUpdates.promoted = updates.promoted;

  const updatedAlbum: AlbumMeta = { ...albums[index], ...definedUpdates };
  const updated = [...albums];
  updated[index] = updatedAlbum;
  await upsertAlbumsInBlobStorage(updated);
  console.log(`Successfully updated album ${slug}`);
  return updatedAlbum;
};

/**
 * Delete an album from the collection. Per-album metadata JSON files are left
 * in storage (versioned, non-destructive). Image-file deletion is handled at
 * the endpoint level.
 */
export const deleteAlbumFromBlobStorage = async (
  slug: string
): Promise<void> => {
  const albums = await getAlbumsFromBlobStorage();
  const filtered = albums.filter((album) => album.slug !== slug);

  if (filtered.length === albums.length) {
    console.log(`Cannot delete: album ${slug} not found`);
    return;
  }

  await upsertAlbumsInBlobStorage(filtered);
  console.log(`Successfully removed album ${slug} from collection`);
};

import { list } from "@vercel/blob";
import type { AlbumCollection, AlbumMeta, ReturnType } from "~/types";

const ALBUMS_METADATA_PREFIX = "metadata/albums";
const CURRENT_VERSION_FILE = "metadata/current-albums-version.json";

const getCurrentVersionInfo = async (): Promise<{
  path: string;
  timestamp: number;
} | null> => {
  try {
    const { blobs } = await list({ prefix: CURRENT_VERSION_FILE });
    const versionBlob = blobs.find((b) => b.pathname === CURRENT_VERSION_FILE);

    if (!versionBlob) {
      return null;
    }

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
    const versionInfo = await getCurrentVersionInfo();

    if (versionInfo) {
      const response = await fetch(
        `https://cqd6ktki9lxhwj73.public.blob.vercel-storage.com/${versionInfo.path}`
      );

      if (response.ok) {
        return await response.json();
      }
    }

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
      return [];
    }

    const latestFile = metadataFiles[0];
    const response = await fetch(latestFile.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get albums:", error);
    return [];
  }
};

export const getPromotedAlbumsFromBlobStorage =
  async (): Promise<AlbumCollection> => {
    const albums = await getAlbumsFromBlobStorage();
    return albums.filter((album) => album.promoted).slice(0, 4);
  };

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
      return [];
    }

    const latestFile = metadataFiles[0];
    const response = await fetch(latestFile.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch album metadata: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to get metadata for album ${slug}:`, error);
    return [];
  }
};

export const findAlbumInBlobStorage = async (
  slug: string
): Promise<AlbumMeta | undefined> => {
  const albums = await getAlbumsFromBlobStorage();
  return albums.find((album) => album.slug === slug);
};

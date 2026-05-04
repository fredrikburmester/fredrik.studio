import { del, list, put } from "@vercel/blob";
import type { AlbumCollection, AlbumMeta, ReturnType } from "~/types";

const ALBUMS_METADATA_PREFIX = "metadata/albums";
const CURRENT_VERSION_FILE = "metadata/current-albums-version.json";

const SCHEMA_VERSION = 1;

type VersionInfo = { path: string; timestamp: number };

const RECENT_WRITE_TTL_MS = 30_000;
const recentWrites = new Map<string, { info: VersionInfo; until: number }>();

const writeQueue = new Map<string, Promise<unknown>>();

const withWriteLock = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const prev = writeQueue.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  writeQueue.set(
    key,
    next.finally(() => {
      if (writeQueue.get(key) === next) writeQueue.delete(key);
    }),
  );
  return next;
};

const rememberWrite = (key: string, info: VersionInfo) => {
  recentWrites.set(key, { info, until: Date.now() + RECENT_WRITE_TTL_MS });
};

const getRememberedWrite = (key: string): VersionInfo | null => {
  const hit = recentWrites.get(key);
  if (!hit) return null;
  if (hit.until < Date.now()) {
    recentWrites.delete(key);
    return null;
  }
  return hit.info;
};

type AlbumsEnvelope = {
  schemaVersion: number;
  albums: AlbumCollection;
};

type ItemsEnvelope = {
  schemaVersion: number;
  items: ReturnType;
};

const noStoreFetch = async (url: string) => {
  const cacheBuster = `?v=${Date.now()}&r=${Math.random()}`;
  return fetch(url + cacheBuster, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
};

const getCurrentVersionInfo = async (): Promise<VersionInfo | null> => {
  const remembered = getRememberedWrite(CURRENT_VERSION_FILE);
  if (remembered) return remembered;
  try {
    const { blobs } = await list({ prefix: CURRENT_VERSION_FILE });
    const versionBlob = blobs.find((b) => b.pathname === CURRENT_VERSION_FILE);
    if (!versionBlob) return null;

    const response = await noStoreFetch(versionBlob.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch version info: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to get current version:", error);
    return null;
  }
};

const fetchAlbumsByVersion = async (
  version: VersionInfo,
): Promise<AlbumCollection | null> => {
  try {
    const { blobs } = await list({ prefix: version.path });
    const target = blobs.find((b) => b.pathname === version.path);
    if (!target) return null;
    const response = await noStoreFetch(target.url);
    if (!response.ok) return null;
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && typeof json === "object" && Array.isArray(json.albums)) {
      return json.albums;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch albums by version:", error);
    return null;
  }
};

const legacyAlbumsRead = async (): Promise<AlbumCollection> => {
  const { blobs } = await list({ prefix: ALBUMS_METADATA_PREFIX });
  const metadataFiles = blobs
    .filter(
      (blob) =>
        blob.pathname.startsWith(ALBUMS_METADATA_PREFIX) &&
        blob.pathname.endsWith(".json") &&
        !blob.pathname.includes("/"),
    )
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  const first = metadataFiles[0];
  if (!first) return [];
  const response = await noStoreFetch(first.url);
  if (!response.ok) return [];
  const json = await response.json();
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object" && Array.isArray(json.albums)) {
    return json.albums;
  }
  return [];
};

export const getAlbumsFromBlobStorage = async (): Promise<AlbumCollection> => {
  try {
    const versionInfo = await getCurrentVersionInfo();
    if (versionInfo) {
      const albums = await fetchAlbumsByVersion(versionInfo);
      if (albums) return albums;
    }
    return await legacyAlbumsRead();
  } catch (error) {
    console.error("Failed to get albums:", error);
    return [];
  }
};

export const getAlbumsWithVersion = async (): Promise<{
  albums: AlbumCollection;
  version: VersionInfo | null;
}> => {
  const versionInfo = await getCurrentVersionInfo();
  if (versionInfo) {
    const albums = await fetchAlbumsByVersion(versionInfo);
    if (albums) return { albums, version: versionInfo };
  }
  return { albums: await legacyAlbumsRead(), version: null };
};

export const getPromotedAlbumsFromBlobStorage =
  async (): Promise<AlbumCollection> => {
    const albums = await getAlbumsFromBlobStorage();
    return albums.filter((album) => album.promoted).slice(0, 4);
  };

const albumPointerPath = (slug: string) =>
  `metadata/albums/${slug}/current.json`;

const fetchPointer = async (
  pointerPath: string,
): Promise<VersionInfo | null> => {
  const remembered = getRememberedWrite(pointerPath);
  if (remembered) return remembered;
  try {
    const { blobs } = await list({ prefix: pointerPath });
    const found = blobs.find((b) => b.pathname === pointerPath);
    if (!found) return null;
    const response = await noStoreFetch(found.url);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch pointer:", pointerPath, err);
    return null;
  }
};

const fetchItemsByVersion = async (
  version: VersionInfo,
): Promise<ReturnType | null> => {
  try {
    const { blobs } = await list({ prefix: version.path });
    const target = blobs.find((b) => b.pathname === version.path);
    if (!target) return null;
    const response = await noStoreFetch(target.url);
    if (!response.ok) return null;
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && typeof json === "object" && Array.isArray(json.items)) {
      return json.items;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch items by version:", err);
    return null;
  }
};

const legacyAlbumMetaRead = async (slug: string): Promise<ReturnType> => {
  const { blobs } = await list({ prefix: `metadata/albums/${slug}` });
  const metadataFiles = blobs
    .filter(
      (blob) =>
        blob.pathname.includes(slug) &&
        blob.pathname.endsWith(".json") &&
        !blob.pathname.endsWith("/current.json"),
    )
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  const first = metadataFiles[0];
  if (!first) return [];
  const response = await noStoreFetch(first.url);
  if (!response.ok) return [];
  const json = await response.json();
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object" && Array.isArray(json.items)) {
    return json.items;
  }
  return [];
};

export const getAlbumMetaFromBlobStorage = async (
  slug: string,
): Promise<ReturnType> => {
  try {
    const pointer = await fetchPointer(albumPointerPath(slug));
    if (pointer) {
      const items = await fetchItemsByVersion(pointer);
      if (items) return items;
    }
    return await legacyAlbumMetaRead(slug);
  } catch (error) {
    console.error(`Failed to get metadata for album ${slug}:`, error);
    return [];
  }
};

export const getAlbumMetaWithVersion = async (
  slug: string,
): Promise<{ items: ReturnType; version: VersionInfo | null }> => {
  const pointer = await fetchPointer(albumPointerPath(slug));
  if (pointer) {
    const items = await fetchItemsByVersion(pointer);
    if (items) return { items, version: pointer };
  }
  return { items: await legacyAlbumMetaRead(slug), version: null };
};

export const findAlbumInBlobStorage = async (
  slug: string,
): Promise<AlbumMeta | undefined> => {
  const albums = await getAlbumsFromBlobStorage();
  return albums.find((album: AlbumMeta) => album.slug === slug);
};

class ConcurrencyError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
  }
}

const sameVersion = (a: VersionInfo | null, b: VersionInfo | null) => {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.path === b.path && a.timestamp === b.timestamp;
};

const writePointer = async (pointerPath: string, info: VersionInfo) => {
  await put(pointerPath, JSON.stringify(info), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
};

export const writeAlbums = async (
  albums: AlbumCollection,
  expectedVersion: VersionInfo | null,
): Promise<VersionInfo> =>
  withWriteLock(CURRENT_VERSION_FILE, async () => {
    const current = await getCurrentVersionInfo();
    if (
      expectedVersion !== null &&
      current !== null &&
      !sameVersion(current, expectedVersion)
    ) {
      throw new ConcurrencyError(
        "Albums collection changed since you started this edit",
      );
    }

    const timestamp = Date.now();
    const path = `${ALBUMS_METADATA_PREFIX}-v${timestamp}.json`;
    const envelope: AlbumsEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      albums,
    };

    await put(path, JSON.stringify(envelope), {
      access: "public",
      contentType: "application/json",
      cacheControlMaxAge: 31536000,
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    const info: VersionInfo = { path, timestamp };
    await writePointer(CURRENT_VERSION_FILE, info);
    rememberWrite(CURRENT_VERSION_FILE, info);
    return info;
  });

export const writeAlbumMeta = async (
  slug: string,
  items: ReturnType,
  expectedVersion: VersionInfo | null,
): Promise<VersionInfo> =>
  withWriteLock(albumPointerPath(slug), async () => {
    const current = await fetchPointer(albumPointerPath(slug));
    if (
      expectedVersion !== null &&
      current !== null &&
      !sameVersion(current, expectedVersion)
    ) {
      throw new ConcurrencyError(
        `Album "${slug}" metadata changed since you started this edit`,
      );
    }

    const timestamp = Date.now();
    const path = `metadata/albums/${slug}/v${timestamp}.json`;
    const envelope: ItemsEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      items,
    };

    await put(path, JSON.stringify(envelope), {
      access: "public",
      contentType: "application/json",
      cacheControlMaxAge: 31536000,
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    const info: VersionInfo = { path, timestamp };
    await writePointer(albumPointerPath(slug), info);
    rememberWrite(albumPointerPath(slug), info);
    return info;
  });

export const deleteAlbumBlobs = async (slug: string): Promise<void> => {
  const prefixes = [`albums/${slug}/`, `metadata/albums/${slug}/`];
  const urls: string[] = [];
  for (const prefix of prefixes) {
    let cursor: string | undefined;
    do {
      const { blobs, cursor: nextCursor, hasMore } = await list({
        prefix,
        cursor,
      });
      urls.push(...blobs.map((b) => b.url));
      cursor = hasMore ? nextCursor : undefined;
    } while (cursor);
  }
  if (urls.length === 0) return;
  const CHUNK = 100;
  for (let i = 0; i < urls.length; i += CHUNK) {
    await del(urls.slice(i, i + CHUNK));
  }
};

export const deleteImageBlobs = async (
  slug: string,
  name: string,
): Promise<void> => {
  const prefixes = [
    `albums/${slug}/${name}`,
    `albums/${slug}/thumbs/${name}`,
    `albums/${slug}/lqip/${name}`,
  ];
  const urls: string[] = [];
  for (const prefix of prefixes) {
    const { blobs } = await list({ prefix });
    urls.push(
      ...blobs
        .filter(
          (b) =>
            b.pathname === prefix ||
            b.pathname.startsWith(`${prefix}.`) ||
            b.pathname.startsWith(`${prefix}_`),
        )
        .map((b) => b.url),
    );
  }
  if (urls.length === 0) return;
  await del(urls);
};

export { ConcurrencyError };
export type { VersionInfo };

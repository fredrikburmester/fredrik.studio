import { requireAdmin } from "../../utils/auth";
import { requireCsrf } from "../../utils/csrf";
import type { AlbumCollection, AlbumMeta } from "~/types";
import {
  ConcurrencyError,
  getAlbumsWithVersion,
  writeAlbums,
} from "../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  requireCsrf(event);

  const body = await readBody<{
    order?: string[];
    baseVersion?: { path: string; timestamp: number } | null;
  }>(event);

  const order = Array.isArray(body?.order) ? body.order : [];
  if (order.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Order array required" });
  }

  const { albums, version } = await getAlbumsWithVersion();
  const baseVersion = body?.baseVersion ?? version;

  if (order.length !== albums.length) {
    throw createError({
      statusCode: 409,
      statusMessage: "Order length does not match current album set",
    });
  }

  const bySlug = new Map<string, AlbumMeta>(
    albums.map((a: AlbumMeta) => [a.slug, a] as const),
  );
  const next: AlbumCollection = [];
  for (const slug of order) {
    const album = bySlug.get(slug);
    if (!album) {
      throw createError({
        statusCode: 409,
        statusMessage: `Unknown album in order: ${slug}`,
      });
    }
    next.push(album);
  }

  try {
    const newVersion = await writeAlbums(next, baseVersion);
    return { ok: true, version: newVersion };
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      throw createError({ statusCode: 409, statusMessage: err.message });
    }
    throw err;
  }
});

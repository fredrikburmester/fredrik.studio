import { requireAdmin } from "../../utils/auth";
import { requireCsrf } from "../../utils/csrf";
import type { AlbumMeta } from "~/types";
import {
  ConcurrencyError,
  getAlbumsWithVersion,
  writeAlbums,
} from "../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  requireCsrf(event);

  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Slug required" });
  }

  const body = await readBody<{
    title?: string;
    description?: string | null;
    posterImage?: string | null;
    promoted?: boolean;
    type?: string | null;
    baseVersion?: { path: string; timestamp: number } | null;
  }>(event);

  const { albums, version } = await getAlbumsWithVersion();
  const baseVersion = body?.baseVersion ?? version;

  const idx = albums.findIndex((a: { slug: string }) => a.slug === slug);
  if (idx === -1) {
    throw createError({ statusCode: 404, statusMessage: "Album not found" });
  }

  const current = albums[idx];
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "Album not found" });
  }
  const updated: AlbumMeta = { ...current };

  if (typeof body?.title === "string") {
    const title = body.title.trim();
    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: "Title cannot be empty",
      });
    }
    updated.title = title;
  }
  if (body?.description !== undefined) {
    updated.description = body.description?.trim() || undefined;
  }
  if (body?.posterImage !== undefined) {
    updated.posterImage = body.posterImage || undefined;
  }
  if (typeof body?.promoted === "boolean") {
    updated.promoted = body.promoted;
  }
  if (body?.type !== undefined) {
    updated.type = body.type?.trim() || undefined;
  }

  const next = [...albums];
  next[idx] = updated;

  try {
    const newVersion = await writeAlbums(next, baseVersion);
    return { ok: true, album: updated, version: newVersion };
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      throw createError({ statusCode: 409, statusMessage: err.message });
    }
    throw err;
  }
});

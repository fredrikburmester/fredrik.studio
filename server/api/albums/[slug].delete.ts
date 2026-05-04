import { requireAdmin } from "../../utils/auth";
import { requireCsrf } from "../../utils/csrf";
import {
  ConcurrencyError,
  deleteAlbumBlobs,
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
    confirm?: string;
    baseVersion?: { path: string; timestamp: number } | null;
  }>(event);

  if (body?.confirm !== slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Confirmation must match album slug",
    });
  }

  const { albums, version } = await getAlbumsWithVersion();
  const baseVersion = body?.baseVersion ?? version;

  if (!albums.some((a: { slug: string }) => a.slug === slug)) {
    throw createError({ statusCode: 404, statusMessage: "Album not found" });
  }

  const next = albums.filter((a: { slug: string }) => a.slug !== slug);

  try {
    const newVersion = await writeAlbums(next, baseVersion);
    deleteAlbumBlobs(slug).catch((err) => {
      console.error(`Best-effort blob cleanup failed for ${slug}:`, err);
    });
    return { ok: true, version: newVersion };
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      throw createError({ statusCode: 409, statusMessage: err.message });
    }
    throw err;
  }
});

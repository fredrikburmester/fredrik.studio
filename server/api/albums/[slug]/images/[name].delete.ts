import { requireAdmin } from "../../../../utils/auth";
import { requireCsrf } from "../../../../utils/csrf";
import {
  ConcurrencyError,
  deleteImageBlobs,
  getAlbumMetaWithVersion,
  writeAlbumMeta,
} from "../../../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  requireCsrf(event);

  const slug = getRouterParam(event, "slug");
  const name = getRouterParam(event, "name");
  if (!slug || !name) {
    throw createError({ statusCode: 400, statusMessage: "slug and name required" });
  }

  const body = await readBody<{
    baseVersion?: { path: string; timestamp: number } | null;
  }>(event).catch(() => null);

  const { items, version } = await getAlbumMetaWithVersion(slug);
  const baseVersion = body?.baseVersion ?? version;

  if (!items.some((i: { name: string }) => i.name === name)) {
    throw createError({ statusCode: 404, statusMessage: "Image not found" });
  }

  const next = items.filter((i: { name: string }) => i.name !== name);

  try {
    const newVersion = await writeAlbumMeta(slug, next, baseVersion);
    deleteImageBlobs(slug, name).catch((err) => {
      console.error(`Best-effort image cleanup failed for ${slug}/${name}:`, err);
    });
    return { ok: true, version: newVersion };
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      throw createError({ statusCode: 409, statusMessage: err.message });
    }
    throw err;
  }
});

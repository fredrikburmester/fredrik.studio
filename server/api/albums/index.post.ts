import { requireAdmin } from "../../utils/auth";
import { requireCsrf } from "../../utils/csrf";
import {
  ConcurrencyError,
  getAlbumsWithVersion,
  writeAlbumMeta,
  writeAlbums,
} from "../../utils/blob-storage";
import type { AlbumMeta } from "~/types";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  requireCsrf(event);

  const body = await readBody<{
    title?: string;
    slug?: string;
    description?: string;
    promoted?: boolean;
    type?: string;
    baseVersion?: { path: string; timestamp: number } | null;
  }>(event);

  const title = body?.title?.trim();
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: "Title required" });
  }

  const slug = slugify(body?.slug?.trim() || title);
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Could not derive slug" });
  }

  const { albums, version } = await getAlbumsWithVersion();
  const baseVersion = body?.baseVersion ?? version;

  if (albums.some((a: { slug: string }) => a.slug === slug)) {
    throw createError({
      statusCode: 409,
      statusMessage: "An album with that slug already exists",
    });
  }

  const album: AlbumMeta = {
    slug,
    title,
    description: body?.description?.trim() || undefined,
    createdAt: new Date().toISOString(),
    promoted: Boolean(body?.promoted),
    type: body?.type?.trim() || undefined,
  };

  try {
    const newVersion = await writeAlbums([...albums, album], baseVersion);
    await writeAlbumMeta(slug, [], null);
    return { ok: true, album, version: newVersion };
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      throw createError({ statusCode: 409, statusMessage: err.message });
    }
    throw err;
  }
});

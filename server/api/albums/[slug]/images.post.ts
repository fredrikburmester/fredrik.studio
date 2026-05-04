import { requireAdmin } from "../../../utils/auth";
import { requireCsrf } from "../../../utils/csrf";
import {
  ConcurrencyError,
  findAlbumInBlobStorage,
  getAlbumMetaWithVersion,
  writeAlbumMeta,
} from "../../../utils/blob-storage";
import { processUploadedOriginal, type UploadInput } from "../../../utils/uploader";

export const config = { maxDuration: 60 };

const MAX_RETRIES = 4;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  requireCsrf(event);

  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Slug required" });
  }

  const album = await findAlbumInBlobStorage(slug);
  if (!album) {
    throw createError({ statusCode: 404, statusMessage: "Album not found" });
  }

  const body = await readBody<{ uploads?: UploadInput[] }>(event);

  const uploads = Array.isArray(body?.uploads) ? body.uploads : [];
  if (uploads.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No uploads provided" });
  }
  if (uploads.length > 25) {
    throw createError({
      statusCode: 400,
      statusMessage: "Batch size limited to 25 uploads",
    });
  }

  for (const input of uploads) {
    if (!input?.blobUrl || !input?.originalName) {
      throw createError({
        statusCode: 400,
        statusMessage: "Each upload requires { blobUrl, originalName }",
      });
    }
  }

  const processed = [];
  for (const input of uploads) {
    processed.push(await processUploadedOriginal(slug, input));
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const { items, version } = await getAlbumMetaWithVersion(slug);
    try {
      const newVersion = await writeAlbumMeta(
        slug,
        [...items, ...processed],
        version,
      );
      return { ok: true, items: processed, version: newVersion };
    } catch (err) {
      if (err instanceof ConcurrencyError && attempt < MAX_RETRIES) {
        await sleep(150 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
});

import { requireAdmin } from "../../utils/auth";
import { getAlbumMetaWithVersion } from "../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const slug = getQuery(event)?.slug;
  if (typeof slug !== "string" || !slug) {
    throw createError({ statusCode: 400, statusMessage: "slug query required" });
  }
  return await getAlbumMetaWithVersion(slug);
});

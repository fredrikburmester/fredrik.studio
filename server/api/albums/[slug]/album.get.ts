import { findAlbumInBlobStorage } from "../../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);

  if (!slug || typeof slug !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid album slug",
    });
  }

  const album = await findAlbumInBlobStorage(slug.toLowerCase());

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album not found",
    });
  }

  return album;
});

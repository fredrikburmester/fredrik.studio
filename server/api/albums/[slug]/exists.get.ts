import { findAlbumInBlobStorage } from "../../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params as { slug: string };
  const album = await findAlbumInBlobStorage(slug.toLowerCase());
  return Boolean(album);
});

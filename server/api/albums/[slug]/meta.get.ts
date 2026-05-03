import { getAlbumMetaFromBlobStorage } from "../../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params as { slug: string };
  return await getAlbumMetaFromBlobStorage(slug.toLowerCase());
});

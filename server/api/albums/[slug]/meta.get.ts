import { imageService } from "../../../utils/kv-images";

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params as { slug: string };
  return await imageService.getAlbumImages(slug.toLowerCase());
});

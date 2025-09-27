import { albumService } from "../../utils/kv-albums";

export default defineEventHandler(async () => {
  return await albumService.getAllAlbums();
});

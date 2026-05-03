import { getAlbumsFromBlobStorage } from "../../utils/blob-storage";

export default defineEventHandler(async () => {
  return await getAlbumsFromBlobStorage();
});

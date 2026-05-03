import { getPromotedAlbumsFromBlobStorage } from "../../utils/blob-storage";

export default defineEventHandler(async () => {
  return await getPromotedAlbumsFromBlobStorage();
});

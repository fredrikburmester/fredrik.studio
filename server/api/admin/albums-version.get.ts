import { requireAdmin } from "../../utils/auth";
import { getAlbumsWithVersion } from "../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  return await getAlbumsWithVersion();
});

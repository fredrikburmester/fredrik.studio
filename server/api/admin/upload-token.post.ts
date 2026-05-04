import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "../../utils/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const body = (await readBody(event)) as HandleUploadBody;
  const req = event.node.req;
  const token = useRuntimeConfig().blobReadWriteToken;

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: "BLOB_READ_WRITE_TOKEN missing",
    });
  }

  try {
    const json = await handleUpload({
      body,
      request: req as unknown as Request,
      token,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED,
        maximumSizeInBytes: MAX_SIZE,
        addRandomSuffix: true,
        cacheControlMaxAge: 60,
      }),
      onUploadCompleted: async () => {},
    });
    return json;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload token error";
    throw createError({ statusCode: 400, statusMessage: message });
  }
});

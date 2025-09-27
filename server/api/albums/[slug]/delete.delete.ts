import { createError } from "#imports";
import { deleteImageFromAlbum } from "~/server/utils/uploader";

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== "DELETE") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  const { slug } = getRouterParams(event);
  const body = await readBody(event);

  if (!slug || !body?.password || !body?.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: "Album slug, password, and filename are required",
    });
  }

  // Basic password check (same as upload endpoint)
  const PASSWORD = process.env.UPLOAD_PASSWORD;
  if (!PASSWORD) {
    throw createError({
      statusCode: 500,
      statusMessage: "Upload password not configured",
    });
  }

  if (body.password !== PASSWORD) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid password",
    });
  }

  try {
    await deleteImageFromAlbum(slug, body.filename);
    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || "Failed to delete image",
    });
  }
});

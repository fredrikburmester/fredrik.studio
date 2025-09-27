import { albumService } from "../../../utils/kv-albums";
import { createError, readBody } from "#imports";

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== "PATCH") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  const { slug } = getRouterParams(event);
  if (!slug || typeof slug !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid album slug",
    });
  }

  const body = await readBody(event);

  if (!body?.password || body.password !== process.env.UPLOAD_PASSWORD) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid password",
    });
  }

  const updates = body?.updates;

  if (!updates || typeof updates !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "No updates provided",
    });
  }

  try {
    const album = await albumService.getAlbum(slug);
    if (!album) {
      throw createError({
        statusCode: 404,
        statusMessage: "Album not found",
      });
    }

    await albumService.updateAlbum(slug, updates);

    const updatedAlbum = await albumService.getAlbum(slug);

    return {
      success: true,
      album: updatedAlbum,
    };
  } catch (error) {
    console.error("Failed to update album:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update album",
    });
  }
});

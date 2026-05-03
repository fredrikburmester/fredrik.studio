import {
  findAlbumInBlobStorage,
  promoteAlbumInBlobStorage,
  unpromoteAlbumInBlobStorage,
} from "../../../utils/blob-storage";
import { createError, readBody } from "#imports";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);
  const { password, promoted } = await readBody(event);

  // Validate password
  if (password !== process.env.UPLOAD_PASSWORD) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid password",
    });
  }

  // Validate slug
  if (!slug || typeof slug !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid album slug",
    });
  }

  // Validate promoted parameter
  if (typeof promoted !== "boolean") {
    throw createError({
      statusCode: 400,
      statusMessage: "Promoted must be a boolean value",
    });
  }

  try {
    // Check if album exists
    const albumExists = Boolean(await findAlbumInBlobStorage(slug));
    if (!albumExists) {
      throw createError({
        statusCode: 404,
        statusMessage: "Album not found",
      });
    }

    // Update promoted status
    if (promoted) {
      const success = await promoteAlbumInBlobStorage(slug);
      if (!success) {
        throw createError({
          statusCode: 400,
          statusMessage: "Maximum 4 promoted albums allowed",
        });
      }
    } else {
      await unpromoteAlbumInBlobStorage(slug);
    }

    return {
      success: true,
      slug,
      promoted,
    };
  } catch (error) {
    console.error("Failed to update album promoted status:", error);

    // Re-throw if it's already a createError
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update album promoted status",
    });
  }
});

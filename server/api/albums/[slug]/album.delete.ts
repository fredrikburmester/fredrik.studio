import { createError, readBody } from "#imports";
import { albumService } from "../../../utils/kv-albums";
import { imageService } from "../../../utils/kv-images";
import { deleteFromBlob, buildBlobPath } from "../../../utils/blob";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);
  const { password } = await readBody(event);

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

  try {
    // Check if album exists
    const album = await albumService.getAlbum(slug);
    if (!album) {
      throw createError({
        statusCode: 404,
        statusMessage: "Album not found",
      });
    }

    // Get all images to delete from blob storage
    const images = await imageService.getAlbumImages(slug);

    // Build list of blob paths to delete
    const blobPathsToDelete: string[] = [];
    const basePath = buildBlobPath("albums", slug);

    for (const image of images) {
      blobPathsToDelete.push(
        buildBlobPath(basePath, image.name), // original
        buildBlobPath(basePath, "thumbs", image.name), // thumbnail
        buildBlobPath(basePath, "lqip", image.name) // lqip
      );
    }

    // Also delete cover image if it exists and is different from regular images
    if (
      album.coverImage &&
      !album.coverImage.includes("/thumbs/") &&
      !album.coverImage.includes("/lqip/")
    ) {
      const coverFilename = album.coverImage.split("/").pop() || "cover.jpg";
      if (!images.some((img) => img.name === coverFilename)) {
        blobPathsToDelete.push(
          buildBlobPath(basePath, coverFilename),
          buildBlobPath(basePath, "thumbs", coverFilename),
          buildBlobPath(basePath, "lqip", coverFilename)
        );
      }
    }

    // Delete from blob storage (if there are files to delete)
    if (blobPathsToDelete.length > 0) {
      await deleteFromBlob(blobPathsToDelete);
    }

    // Delete from Redis
    await Promise.all([
      // Remove album from promoted list (if it's promoted)
      album.promoted ? albumService.unpromoteAlbum(slug) : Promise.resolve(),
      // Clear all album images
      imageService.clearAlbumImages(slug),
      // Delete album metadata
      albumService.deleteAlbum(slug),
    ]);

    return {
      success: true,
      message: `Album "${slug}" deleted successfully`,
      deletedImages: images.length,
      deletedBlobFiles: blobPathsToDelete.length,
    };
  } catch (error) {
    console.error("Failed to delete album:", error);

    // Re-throw if it's already a createError
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete album",
    });
  }
});

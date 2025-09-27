import { albumService } from "../../../utils/kv-albums";
import { imageService } from "../../../utils/kv-images";
import {
  uploadImageToBlob,
  generateImageFilename,
} from "../../../utils/blob-uploader";
import type { RedisAlbum } from "../../../../types/redis";
import { createError, readMultipartFormData, useRuntimeConfig } from "#imports";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const password = runtimeConfig.uploadPassword;

  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid form data",
    });
  }

  const fields = new Map<string, string>();

  for (const item of formData) {
    if (item.type === "file") {
      continue;
    }
    if (typeof item.data === "string") {
      fields.set(item.name || "", item.data);
    } else if (item.data instanceof Buffer) {
      // Handle Buffer data as string
      fields.set(item.name || "", item.data.toString());
    }
  }

  // Debug: Log form data structure
  console.log(
    "FormData items:",
    formData.map((item) => ({
      name: item.name,
      type: item.type,
      filename: item.filename,
      dataType: typeof item.data,
      dataSize: item.data instanceof Buffer ? item.data.length : "N/A",
    }))
  );

  const files = formData.filter(
    (item) => item.filename && item.name === "images"
  );

  console.log("Filtered files:", files.length);

  if (fields.get("password") !== password) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const albumSlug = (fields.get("album") || "").toLowerCase();
  if (!albumSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Album slug is required",
    });
  }

  const createAlbumFlag = fields.get("createAlbum");

  // Check if album exists
  let album = await albumService.getAlbum(albumSlug);

  if (!album && !createAlbumFlag) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Album does not exist. Provide createAlbum flag to create it.",
    });
  }

  // Create album if it doesn't exist
  if (!album && createAlbumFlag) {
    const newAlbum: Omit<RedisAlbum, "imageCount"> = {
      slug: albumSlug,
      title: fields.get("title") || albumSlug,
      description: fields.get("description"),
      createdAt: new Date().toISOString(),
      promoted: false,
    };
    await albumService.createAlbum(newAlbum);
    album = await albumService.getAlbum(albumSlug);
  }

  if (!album) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create or retrieve album",
    });
  }

  const uploadedImages = [];

  // Get current image count for filename generation
  const currentImageCount = await imageService.getImageCount(albumSlug);

  // Upload all images to blob storage and Redis
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.filename) {
      continue;
    }

    const buffer = file.data as Buffer;

    // Generate filename
    const filename = generateImageFilename(currentImageCount + i);

    // Upload to blob storage
    const imageData = await uploadImageToBlob({
      albumSlug,
      filename,
      file: buffer,
    });

    // Add to Redis
    await imageService.addImageToAlbum(albumSlug, imageData);
    uploadedImages.push(imageData);
  }

  // Set cover image if this is the first image in the album
  if (uploadedImages.length > 0 && !album.coverImage) {
    await albumService.updateCoverImage(
      albumSlug,
      uploadedImages[0].paths.original
    );
  }

  return {
    success: true,
    uploaded: uploadedImages,
  };
});

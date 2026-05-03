import {
  findAlbumInBlobStorage,
  ensureAlbumExistsInBlobStorage,
  ensureAlbumCover,
  getAlbumMetaFromBlobStorage,
  upsertAlbumMetaInBlobStorage,
} from "../../../utils/blob-storage";
import { uploadImageToAlbum } from "../../../utils/uploader";
import { buildBlobPath } from "../../../utils/blob";
import type { AlbumMeta, ReturnItem } from "../../../../types";
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
  let album = await findAlbumInBlobStorage(albumSlug);

  if (!album && !createAlbumFlag) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Album does not exist. Provide createAlbum flag to create it.",
    });
  }

  // Create album if it doesn't exist
  if (!album && createAlbumFlag) {
    const newAlbum: AlbumMeta = {
      slug: albumSlug,
      title: fields.get("title") || albumSlug,
      description: fields.get("description"),
      createdAt: new Date().toISOString(),
      promoted: false,
    };
    await ensureAlbumExistsInBlobStorage(newAlbum);
    album = await findAlbumInBlobStorage(albumSlug);
  }

  if (!album) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create or retrieve album",
    });
  }

  // Read existing image meta ONCE before the loop
  const existingMeta = await getAlbumMetaFromBlobStorage(albumSlug);
  const runningMeta: ReturnItem[] = [...existingMeta];
  const uploadedImages: ReturnItem[] = [];

  // Upload all images to blob storage
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.filename) {
      continue;
    }

    const buffer = file.data as Buffer;

    const result = await uploadImageToAlbum({
      album,
      file: buffer,
      existingMeta: runningMeta,
    });

    // Strip imagePath; only persist ReturnItem fields
    const { imagePath: _imagePath, ...meta } = result;
    uploadedImages.push(meta);
    runningMeta.push(meta);
  }

  // Persist per-album meta JSON once
  if (uploadedImages.length > 0) {
    await upsertAlbumMetaInBlobStorage(albumSlug, runningMeta);
  }

  // Set cover image if this is the first image in the album
  if (uploadedImages.length > 0) {
    await ensureAlbumCover(
      albumSlug,
      buildBlobPath("albums", albumSlug, uploadedImages[0].name)
    );
  }

  return {
    success: true,
    uploaded: uploadedImages,
  };
});

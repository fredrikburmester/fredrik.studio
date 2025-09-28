import sharp from "sharp";
import { createError } from "#imports";

import { buildBlobPath, uploadToBlob, deleteFromBlob } from "./blob";
import {
  ensureAlbumCover,
  ensureAlbumExistsInBlobStorage,
  getAlbumMetaFromBlobStorage,
  upsertAlbumMetaInBlobStorage,
  upsertAlbumInBlobStorage,
  getAlbumsFromBlobStorage,
  upsertAlbumsInBlobStorage,
} from "./blob-storage";
import type { ReturnItem, AlbumMeta } from "../../types";

type ProcessedImage = {
  original: Buffer;
  thumbnail: Buffer;
  lqip: Buffer;
  meta: ReturnItem;
};

type UploadImageOptions = {
  album: AlbumMeta;
  filename?: string;
  file: Buffer;
};

const MAX_THUMBNAIL_SIZE = 800; // Changed from 1200
const LQIP_SIZE = 24;
const LQIP_TARGET_SIZE = 5 * 1024; // 5kb

const computeDominantColor = (stats: sharp.Stats) =>
  stats.channels.slice(0, 3).map((channel) => Math.round(channel.mean));

const processImage = async (
  file: Buffer,
  filename: string
): Promise<ProcessedImage> => {
  const image = sharp(file);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unable to read image dimensions for ${filename}`,
    });
  }

  const stats = await image.stats();

  const thumbnail = await image
    .clone()
    .resize({
      width: MAX_THUMBNAIL_SIZE,
      height: MAX_THUMBNAIL_SIZE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  const lqip = await image
    .clone()
    .resize({
      width: LQIP_SIZE,
      height: LQIP_SIZE,
      fit: "cover",
    })
    .blur(10)
    .jpeg({ quality: 20 })
    .toBuffer();

  const lqipBuffer =
    lqip.length > LQIP_TARGET_SIZE
      ? await sharp(lqip).jpeg({ quality: 10 }).toBuffer()
      : lqip;

  return {
    original: file,
    thumbnail,
    lqip: lqipBuffer,
    meta: {
      name: filename,
      width: metadata.width,
      height: metadata.height,
      format: 1,
      dominantColor: computeDominantColor(stats),
      size: file.length,
      createdAt: new Date().toISOString(),
    },
  };
};

const ensureAlbum = async (album: AlbumMeta) => {
  await ensureAlbumExistsInBlobStorage(album);
};

const generateFilename = async (albumSlug: string, existing: ReturnItem[]) => {
  const prefix = existing.length + 1;
  const padded = prefix.toString().padStart(4, "0");
  return `${padded}.jpg`;
};

export const uploadImageToAlbum = async ({
  album,
  filename,
  file,
  existingMeta = [],
}: UploadImageOptions & { existingMeta?: ReturnItem[] }) => {
  await ensureAlbum(album);

  const uniqueFilename =
    filename || (await generateFilename(album.slug, existingMeta));
  const alreadyExists = existingMeta.some(
    (item) => item.name === uniqueFilename
  );

  if (alreadyExists) {
    throw createError({
      statusCode: 409,
      statusMessage: `Image ${uniqueFilename} already exists in ${album.slug}`,
    });
  }

  const processed = await processImage(file, uniqueFilename);

  const basePath = buildBlobPath("albums", album.slug);

  await Promise.all([
    uploadToBlob(buildBlobPath(basePath, uniqueFilename), processed.original, {
      contentType: "image/jpeg",
    }),
    uploadToBlob(
      buildBlobPath(basePath, "thumbs", uniqueFilename),
      processed.thumbnail,
      {
        contentType: "image/jpeg",
        cacheControlMaxAge: 60 * 60 * 24 * 30,
      }
    ),
    uploadToBlob(
      buildBlobPath(basePath, "lqip", uniqueFilename),
      processed.lqip,
      {
        contentType: "image/jpeg",
        cacheControlMaxAge: 60 * 60 * 24 * 7,
      }
    ),
  ]);

  // Return processed image data with image path for cover image setting
  // The caller will batch update all metadata at once
  return {
    ...processed.meta,
    imagePath: buildBlobPath(basePath, uniqueFilename),
  };
};

export const uploadCoverImageToAlbum = async ({
  album,
  file,
}: {
  album: AlbumMeta;
  file: Buffer;
}) => {
  console.log(`Starting cover image upload for album: ${album.slug}`);
  await ensureAlbum(album);

  const coverFilename = "cover.jpg";
  console.log(`Processing image file, size: ${file.length} bytes`);
  const processed = await processImage(file, coverFilename);

  const basePath = buildBlobPath("albums", album.slug);
  const coverPath = buildBlobPath(basePath, coverFilename);
  const lqipPath = buildBlobPath(basePath, "lqip", coverFilename);

  console.log(`Upload paths - Cover: ${coverPath}, LQIP: ${lqipPath}`);
  console.log(
    `Processed image - Thumbnail: ${processed.thumbnail.length} bytes, LQIP: ${processed.lqip.length} bytes`
  );

  // Upload only thumbnail version for cover (we don't need full size)
  try {
    await Promise.all([
      uploadToBlob(coverPath, processed.thumbnail, {
        contentType: "image/jpeg",
        cacheControlMaxAge: 60 * 60 * 24 * 30,
      }),
      uploadToBlob(lqipPath, processed.lqip, {
        contentType: "image/jpeg",
        cacheControlMaxAge: 60 * 60 * 24 * 7,
      }),
    ]);
    console.log(`Successfully uploaded cover image to blob storage`);
  } catch (uploadError) {
    console.error(`Failed to upload to blob storage:`, uploadError);
    throw uploadError;
  }

  // Update album with new cover image
  console.log(`Updating album metadata with cover path: ${coverPath}`);
  await upsertAlbumInBlobStorage({
    ...album,
    coverImage: coverPath,
  });

  console.log(`Cover image upload completed successfully for ${album.slug}`);
  return {
    success: true,
    coverImage: coverPath,
    meta: processed.meta,
  };
};

export const deleteImageFromAlbum = async (
  albumSlug: string,
  filename: string
) => {
  // Get current album metadata to verify image exists
  const existingMeta = await getAlbumMetaFromBlobStorage(albumSlug);
  const imageToDelete = existingMeta.find(
    (item: ReturnItem) => item.name === filename
  );

  if (!imageToDelete) {
    throw createError({
      statusCode: 404,
      statusMessage: `Image ${filename} not found in album ${albumSlug}`,
    });
  }

  const basePath = buildBlobPath("albums", albumSlug);

  // Delete all versions of the image (original, thumbnail, lqip)
  const pathsToDelete = [
    buildBlobPath(basePath, filename), // original
    buildBlobPath(basePath, "thumbs", filename), // thumbnail
    buildBlobPath(basePath, "lqip", filename), // lqip
  ];

  try {
    await deleteFromBlob(pathsToDelete);
  } catch (error) {
    console.error("Failed to delete image files:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete image files for ${filename}`,
    });
  }

  // Update album metadata by removing the deleted image
  console.log(`Deleting image "${filename}" from album ${albumSlug}`);
  const updatedMeta = existingMeta.filter(
    (item: ReturnItem) => item.name !== filename
  );

  if (updatedMeta.length === existingMeta.length) {
    console.warn(
      `WARNING: Image "${filename}" not found in metadata for album ${albumSlug}`
    );
  }

  try {
    await upsertAlbumMetaInBlobStorage(albumSlug, updatedMeta);
    console.log(
      `Successfully removed ${filename} from album ${albumSlug}. Images remaining: ${updatedMeta.length}`
    );
  } catch (error) {
    console.error(`Failed to update metadata for album ${albumSlug}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update album metadata after deleting ${filename}`,
    });
  }

  // Check if deleted image was the cover image and update if needed
  const albums = await getAlbumsFromBlobStorage();
  const album = albums.find((a: AlbumMeta) => a.slug === albumSlug);
  const deletedImagePath = buildBlobPath(basePath, filename);

  if (album?.coverImage === deletedImagePath) {
    // Set new cover image to the first remaining image, or undefined if no images left
    const newCoverImage =
      updatedMeta.length > 0
        ? buildBlobPath(basePath, updatedMeta[0].name)
        : undefined;

    const updatedAlbums = albums.map((a: AlbumMeta) =>
      a.slug === albumSlug ? { ...a, coverImage: newCoverImage } : a
    );

    await upsertAlbumsInBlobStorage(updatedAlbums);
  }

  return { success: true, deletedImage: imageToDelete };
};

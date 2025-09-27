import sharp from "sharp";
import { createError } from "#imports";
import { buildBlobPath, uploadToBlob } from "./blob";
import type { RedisImage } from "~/types/redis";

type ProcessedImage = {
  original: Buffer;
  thumbnail: Buffer;
  lqip: Buffer;
  meta: RedisImage;
};

const MAX_THUMBNAIL_SIZE = 800;
const LQIP_SIZE = 24;
const LQIP_TARGET_SIZE = 5 * 1024; // 5kb

const computeDominantColor = (stats: sharp.Stats) =>
  stats.channels.slice(0, 3).map((channel) => Math.round(channel.mean));

const processImage = async (
  file: Buffer,
  filename: string,
  albumSlug: string
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

  const basePath = buildBlobPath("albums", albumSlug);

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
      paths: {
        original: buildBlobPath(basePath, filename),
        thumb: buildBlobPath(basePath, "thumbs", filename),
        lqip: buildBlobPath(basePath, "lqip", filename),
      },
    },
  };
};

export const uploadImageToBlob = async ({
  albumSlug,
  filename,
  file,
}: {
  albumSlug: string;
  filename: string;
  file: Buffer;
}): Promise<RedisImage> => {
  const processed = await processImage(file, filename, albumSlug);

  const basePath = buildBlobPath("albums", albumSlug);

  // Upload all versions to blob storage
  await Promise.all([
    uploadToBlob(buildBlobPath(basePath, filename), processed.original, {
      contentType: "image/jpeg",
    }),
    uploadToBlob(
      buildBlobPath(basePath, "thumbs", filename),
      processed.thumbnail,
      {
        contentType: "image/jpeg",
        cacheControlMaxAge: 60 * 60 * 24 * 30,
      }
    ),
    uploadToBlob(buildBlobPath(basePath, "lqip", filename), processed.lqip, {
      contentType: "image/jpeg",
      cacheControlMaxAge: 60 * 60 * 24 * 7,
    }),
  ]);

  return processed.meta;
};

export const generateImageFilename = (existingCount: number): string => {
  const number = existingCount + 1;
  return `${number.toString().padStart(4, "0")}.jpg`;
};

import { put } from "@vercel/blob";
import sharp from "sharp";
import type { ReturnItem } from "~/types";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const THUMB_WIDTH = 800;
const LQIP_WIDTH = 24;

export type UploadInput = {
  blobUrl: string;
  originalName: string;
};

const sanitizeName = (name: string) => {
  const stripped = name.replace(/[^\w.\-]+/g, "_");
  return stripped.length > 200 ? stripped.slice(-200) : stripped;
};

export const processUploadedOriginal = async (
  slug: string,
  input: UploadInput,
): Promise<ReturnItem> => {
  const response = await fetch(input.blobUrl);
  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: `Failed to fetch uploaded blob: ${response.status}`,
    });
  }
  const contentType = response.headers.get("content-type") || "";
  if (!ALLOWED.has(contentType)) {
    throw createError({
      statusCode: 415,
      statusMessage: `Unsupported media type: ${contentType || "unknown"} (JPEG, PNG, or WebP only)`,
    });
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const size = buffer.byteLength;

  const image = sharp(buffer, { failOn: "none" });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw createError({
      statusCode: 415,
      statusMessage: "Image metadata could not be read",
    });
  }

  const stats = await image.stats();
  const dominantColor = [
    Math.round(stats.dominant.r),
    Math.round(stats.dominant.g),
    Math.round(stats.dominant.b),
  ];

  const baseName = sanitizeName(input.originalName);
  const stamp = Date.now();
  const finalName = `${stamp}_${baseName}`;

  const originalPath = `albums/${slug}/${finalName}`;
  const thumbPath = `albums/${slug}/thumbs/${finalName}`;
  const lqipPath = `albums/${slug}/lqip/${finalName}`;

  await put(originalPath, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 31536000,
  });

  const thumbBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await put(thumbPath, thumbBuffer, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 31536000,
  });

  const lqipBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: LQIP_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 50 })
    .toBuffer();
  await put(lqipPath, lqipBuffer, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 31536000,
  });

  return {
    name: finalName,
    width: metadata.width,
    height: metadata.height,
    format: 0,
    dominantColor,
    size,
    createdAt: new Date(stamp).toISOString(),
  };
};

export const ALLOWED_UPLOAD_TYPES = Array.from(ALLOWED);

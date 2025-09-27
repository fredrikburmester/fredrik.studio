import { put, del } from "@vercel/blob";

const DEFAULT_CACHE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type UploadOptions = {
  contentType: string;
  cacheControlMaxAge?: number;
};

export const uploadToBlob = async (
  pathname: string,
  body: Parameters<typeof put>[1],
  { contentType, cacheControlMaxAge = DEFAULT_CACHE_MAX_AGE }: UploadOptions
) => {
  return await put(pathname, body, {
    access: "public",
    contentType,
    allowOverwrite: true,
    cacheControlMaxAge,
    addRandomSuffix: false, // Keep consistent filenames
    multipart: true, // Enable multipart upload for better reliability
  });
};

export const deleteFromBlob = async (paths: string | string[]) => {
  await del(paths);
};

export const buildBlobPath = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .map((part) => part.replace(/^\/|\/$/g, ""))
    .join("/");

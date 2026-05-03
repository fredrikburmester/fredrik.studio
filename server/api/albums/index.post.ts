import {
  findAlbumInBlobStorage,
  upsertAlbumInBlobStorage,
} from "../../utils/blob-storage";
import type { AlbumMeta } from "~/types";
import { createError, readBody } from "#imports";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const password = body?.password;
  const slug = (body?.slug || "").toLowerCase().trim();
  const title = (body?.title || "").trim();
  const description =
    typeof body?.description === "string" ? body.description : "";

  if (!password || password !== process.env.UPLOAD_PASSWORD) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid password",
    });
  }

  if (!slug || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Album slug and title are required",
    });
  }

  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Album slug may only contain lowercase letters, numbers, and hyphens",
    });
  }

  try {
    const existing = await findAlbumInBlobStorage(slug);
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: "An album with this slug already exists",
      });
    }

    const albumData: AlbumMeta = {
      slug,
      title,
      description,
      createdAt: new Date().toISOString(),
      coverImage: undefined,
      promoted: false,
    };

    await upsertAlbumInBlobStorage(albumData);

    const album = await findAlbumInBlobStorage(slug);

    return {
      success: true,
      album,
    };
  } catch (error) {
    console.error("Failed to create album:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create album",
    });
  }
});

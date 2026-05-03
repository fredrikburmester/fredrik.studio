import { readMultipartFormData, createError } from "#imports";
import { findAlbumInBlobStorage } from "../../../utils/blob-storage";
import { uploadCoverImageToAlbum } from "../../../utils/uploader";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);

  // Parse multipart form data
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No form data received",
    });
  }

  // Extract fields from form data
  let password = "";
  let coverImageFile: Buffer | null = null;

  console.log(
    "Processing form data:",
    formData.map((f) => ({
      name: f.name,
      filename: f.filename,
      type: f.type,
      size: f.data.length,
    }))
  );

  for (const field of formData) {
    if (!field.name) {
      continue;
    }

    switch (field.name) {
      case "password":
        password = field.data.toString();
        break;
      case "cover":
        console.log("Found cover field:", {
          filename: field.filename,
          type: field.type,
          size: field.data.length,
        });
        if (field.filename && field.data && field.type?.startsWith("image/")) {
          coverImageFile = field.data;
        }
        break;
    }
  }

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

  // Validate cover image
  if (!coverImageFile) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cover image is required",
    });
  }

  try {
    // Check if album exists
    const album = await findAlbumInBlobStorage(slug);
    if (!album) {
      throw createError({
        statusCode: 404,
        statusMessage: "Album not found",
      });
    }

    // Upload cover image (also persists the new coverImage on the album)
    const result = await uploadCoverImageToAlbum({
      album,
      file: coverImageFile,
    });

    return {
      success: true,
      coverImage: result.coverImage,
      meta: result.meta,
    };
  } catch (error) {
    console.error("Failed to upload cover image:", error);

    // Re-throw if it's already a createError
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to upload cover image",
    });
  }
});

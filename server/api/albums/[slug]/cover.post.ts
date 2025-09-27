import { readMultipartFormData, createError } from "#imports";
import { albumService } from "../../../utils/kv-albums";
import { uploadImageToBlob } from "../../../utils/blob-uploader";

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
    const albumExists = await albumService.albumExists(slug);
    if (!albumExists) {
      throw createError({
        statusCode: 404,
        statusMessage: "Album not found",
      });
    }

    // Upload cover image to blob storage
    const imageData = await uploadImageToBlob({
      albumSlug: slug,
      filename: "cover.jpg",
      file: coverImageFile,
    });

    // Update album's cover image in Redis
    await albumService.updateCoverImage(slug, imageData.paths.original);

    return {
      success: true,
      coverImage: imageData.paths.original,
      meta: imageData,
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

import { kvClient } from "./kv-client";
import { albumService } from "./kv-albums";
import type { RedisImage } from "../../types/redis";

export class ImageService {
  async addImageToAlbum(
    albumSlug: string,
    imageData: RedisImage
  ): Promise<void> {
    try {
      const imageJson = JSON.stringify(imageData);

      await Promise.all([
        kvClient.listPush(`album:${albumSlug}:images`, imageJson),
        kvClient.increment(`album:${albumSlug}:count`),
      ]);

      // Update the album's image count
      const newCount = await kvClient.get(`album:${albumSlug}:count`);
      await albumService.updateImageCount(albumSlug, parseInt(newCount || "0"));
    } catch (error) {
      console.error(
        `Failed to add image to Redis: ${albumSlug}/${imageData.name}`,
        error
      );
      throw error;
    }
  }

  async getAlbumImages(albumSlug: string): Promise<RedisImage[]> {
    const imageStrings = await kvClient.listGetAll(`album:${albumSlug}:images`);
    return imageStrings
      .map((item) => {
        try {
          // If it's already an object, return it directly
          if (typeof item === "object" && item !== null) {
            return item as RedisImage;
          }
          // If it's a string, parse it
          if (typeof item === "string") {
            return JSON.parse(item) as RedisImage;
          }
          console.error("❌ Unexpected Redis data type:", typeof item);
          return null;
        } catch (error) {
          console.error("❌ Failed to parse image data:", typeof item, error);
          return null;
        }
      })
      .filter(Boolean)
      .reverse(); // Most recent first (Redis LPUSH puts newest at front, we want newest first)
  }

  async removeImageFromAlbum(
    albumSlug: string,
    imageName: string
  ): Promise<boolean> {
    const images = await this.getAlbumImages(albumSlug);
    const imageToRemove = images.find((img) => img.name === imageName);

    if (!imageToRemove) {
      return false;
    }

    const imageJson = JSON.stringify(imageToRemove);

    await Promise.all([
      kvClient.listRemove(`album:${albumSlug}:images`, imageJson),
      kvClient.decrement(`album:${albumSlug}:count`),
    ]);

    // Update the album's image count
    const newCount = Math.max(0, images.length - 1);
    await albumService.updateImageCount(albumSlug, newCount);

    return true;
  }

  async getImageCount(albumSlug: string): Promise<number> {
    const count = await kvClient.get(`album:${albumSlug}:count`);
    return parseInt(count || "0");
  }

  async clearAlbumImages(albumSlug: string): Promise<void> {
    await Promise.all([
      kvClient.delete(`album:${albumSlug}:images`),
      kvClient.delete(`album:${albumSlug}:count`),
    ]);
  }
}

export const imageService = new ImageService();

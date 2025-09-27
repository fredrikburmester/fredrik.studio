import { kvClient } from "./kv-client";
import type { RedisAlbum, AlbumResponse } from "../../types/redis";

export class AlbumService {
  async createAlbum(albumData: Omit<RedisAlbum, "imageCount">): Promise<void> {
    const album = { ...albumData, imageCount: 0 };

    await Promise.all([
      kvClient.setAdd("albums:all", album.slug),
      kvClient.hashSetMultiple(`album:${album.slug}`, {
        slug: album.slug,
        title: album.title,
        description: album.description || "",
        createdAt: album.createdAt,
        coverImage: album.coverImage || "",
        promoted: album.promoted,
        imageCount: album.imageCount,
      }),
      kvClient.increment("albums:count"),
    ]);
  }

  async getAlbum(slug: string): Promise<RedisAlbum | null> {
    const data = await kvClient.hashGetAll(`album:${slug}`);
    if (!data.slug) return null;

    return {
      slug: data.slug,
      title: data.title,
      description: data.description || undefined,
      createdAt: data.createdAt,
      coverImage: data.coverImage || undefined,
      promoted: data.promoted === "true",
      imageCount: parseInt(data.imageCount) || 0,
    };
  }

  async getAllAlbums(): Promise<AlbumResponse[]> {
    const slugs = await kvClient.setMembers("albums:all");
    const albums = await Promise.all(slugs.map((slug) => this.getAlbum(slug)));

    return albums
      .filter(Boolean)
      .map((album) => ({
        slug: album!.slug,
        title: album!.title,
        description: album!.description,
        createdAt: album!.createdAt,
        coverImage: album!.coverImage,
        promoted: album!.promoted,
        imageCount: album!.imageCount,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async getPromotedAlbums(): Promise<AlbumResponse[]> {
    const promotedSlugs = await kvClient.setMembers("albums:promoted");
    const albums = await Promise.all(
      promotedSlugs.map((slug) => this.getAlbum(slug))
    );

    return albums
      .filter(Boolean)
      .map((album) => ({
        slug: album!.slug,
        title: album!.title,
        description: album!.description,
        createdAt: album!.createdAt,
        coverImage: album!.coverImage,
        promoted: album!.promoted,
        imageCount: album!.imageCount,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 4); // Ensure max 4
  }

  async promoteAlbum(slug: string): Promise<boolean> {
    const promotedCount = await kvClient.setSize("albums:promoted");
    if (promotedCount >= 4) return false;

    await Promise.all([
      kvClient.setAdd("albums:promoted", slug),
      kvClient.hashSetMultiple(`album:${slug}`, { promoted: true }),
    ]);
    return true;
  }

  async unpromoteAlbum(slug: string): Promise<void> {
    await Promise.all([
      kvClient.setRemove("albums:promoted", slug),
      kvClient.hashSetMultiple(`album:${slug}`, { promoted: false }),
    ]);
  }

  async updateCoverImage(slug: string, coverImage: string): Promise<void> {
    await kvClient.hashSetMultiple(`album:${slug}`, { coverImage });
  }

  async updateImageCount(slug: string, count: number): Promise<void> {
    await kvClient.hashSetMultiple(`album:${slug}`, { imageCount: count });
  }

  async updateAlbum(
    slug: string,
    updates: Partial<Omit<RedisAlbum, "slug" | "imageCount" | "createdAt">> & {
      imageCount?: number;
    }
  ): Promise<void> {
    const payload: Record<string, string | number | boolean> = {};

    if (updates.title !== undefined) {
      payload.title = updates.title;
    }

    if (updates.description !== undefined) {
      payload.description = updates.description;
    }

    if (updates.coverImage !== undefined) {
      payload.coverImage = updates.coverImage;
    }

    if (updates.promoted !== undefined) {
      payload.promoted = updates.promoted;
    }

    if (updates.imageCount !== undefined) {
      payload.imageCount = updates.imageCount;
    }

    if (Object.keys(payload).length === 0) return;

    await kvClient.hashSetMultiple(`album:${slug}`, payload);
  }

  async albumExists(slug: string): Promise<boolean> {
    return await kvClient.setIsMember("albums:all", slug);
  }

  async deleteAlbum(slug: string): Promise<void> {
    await Promise.all([
      // Remove from all albums set
      kvClient.setRemove("albums:all", slug),
      // Remove from promoted albums set
      kvClient.setRemove("albums:promoted", slug),
      // Delete album hash
      kvClient.delete(`album:${slug}`),
      // Decrement total album count
      kvClient.decrement("albums:count"),
    ]);
  }
}

export const albumService = new AlbumService();

export interface RedisAlbum {
  slug: string;
  title: string;
  description?: string;
  createdAt: string;
  coverImage?: string;
  promoted: boolean;
  imageCount: number;
}

export interface RedisImage {
  name: string;
  width: number;
  height: number;
  format: number;
  dominantColor: number[];
  size: number;
  createdAt: string;
  paths: {
    original: string;
    thumb: string;
    lqip: string;
  };
}

export interface AlbumWithImages extends RedisAlbum {
  images: RedisImage[];
}

// For API responses (matches existing AlbumMeta)
export interface AlbumResponse {
  slug: string;
  title: string;
  description?: string;
  createdAt: string;
  coverImage?: string;
  promoted?: boolean;
  imageCount?: number;
}

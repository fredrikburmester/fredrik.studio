export type ReturnItem = {
  name: string;
  width: number;
  height: number;
  format: number;
  dominantColor: number[];
  size: number;
  createdAt?: string;
};

export type ReturnType = ReturnItem[];

export type AlbumMeta = {
  slug: string;
  title: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  promoted?: boolean;
};

export type AlbumCollection = AlbumMeta[];

export type UploadPayload = {
  password: string;
  album: string;
  createAlbum?: {
    title: string;
    description?: string;
    coverImage?: string;
  };
};

export type UploadResponse = {
  success: boolean;
  uploaded: ReturnItem[];
  album?: AlbumMeta;
};

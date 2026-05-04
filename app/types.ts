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
  posterImage?: string;
  createdAt: string;
  promoted?: boolean;
  type?: string;
};

export type AlbumCollection = AlbumMeta[];

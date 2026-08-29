import { GalleryCategory, MediaType } from "@prisma/client";

export interface GalleryQuery {
  category?: GalleryCategory | "ALL";
  type?: MediaType;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface GalleryListItem {
  id: string;
  title: string;
  amharicTitle: string | null;
  category: GalleryCategory;
  type: MediaType;
  coverImage: string;
  description: string;
  eventDate: Date;
  location: string;
  photographer: string | null;
  videoUrl: string | null;
  videoDuration: string | null;
  capturesCount: number;
  isFeatured: boolean;
}

export interface GalleryDetail extends GalleryListItem {
  captures: GalleryCaptureItem[];
}

export interface GalleryCaptureItem {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  title: string;
  caption: string;
  photographer: string | null;
  timestamp: string | null;
}

export interface PaginatedGalleryResponse {
  data: GalleryListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

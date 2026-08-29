import { galleryRepository } from "./gallery.repository";
import { GalleryQuery, PaginatedGalleryResponse, GalleryDetail } from "./gallery.types";
import { NotFoundError } from "../../errors/NotFoundError";
import { cacheGet } from "../../lib/redis";

export class GalleryService {
  /**
   * GET /gallery — Public gallery feed with filtering and pagination
   */
  async list(query: GalleryQuery): Promise<PaginatedGalleryResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    // Cache for 5 minutes
    const cacheKey = `gallery:list:${JSON.stringify(query)}`;
    const result = await cacheGet(cacheKey, 300, () =>
      galleryRepository.findMany({ ...query, page, limit })
    );

    return {
      data: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        amharicTitle: item.amharicTitle,
        category: item.category,
        type: item.type,
        coverImage: item.coverImage,
        description: item.description,
        eventDate: item.eventDate,
        location: item.location,
        photographer: item.photographer,
        videoUrl: item.videoUrl,
        videoDuration: item.videoDuration,
        capturesCount: item.capturesCount,
        isFeatured: item.isFeatured,
      })),
      meta: {
        total: result.total,
        page,
        limit,
      },
    };
  }

  /**
   * GET /gallery/:id — Gallery album detail with captures
   */
  async getById(id: string): Promise<GalleryDetail> {
    const cacheKey = `gallery:detail:${id}`;
    const gallery = await cacheGet(cacheKey, 300, () =>
      galleryRepository.findById(id)
    );

    if (!gallery) {
      throw new NotFoundError("Gallery album not found.");
    }

    return {
      id: gallery.id,
      title: gallery.title,
      amharicTitle: gallery.amharicTitle,
      category: gallery.category,
      type: gallery.type,
      coverImage: gallery.coverImage,
      description: gallery.description,
      eventDate: gallery.eventDate,
      location: gallery.location,
      photographer: gallery.photographer,
      videoUrl: gallery.videoUrl,
      videoDuration: gallery.videoDuration,
      capturesCount: gallery.capturesCount,
      isFeatured: gallery.isFeatured,
      captures: gallery.captures.map((capture) => ({
        id: capture.id,
        url: capture.url,
        thumbnailUrl: capture.thumbnailUrl,
        title: capture.title,
        caption: capture.caption,
        photographer: capture.photographer,
        timestamp: capture.timestamp,
      })),
    };
  }
}

export const galleryService = new GalleryService();

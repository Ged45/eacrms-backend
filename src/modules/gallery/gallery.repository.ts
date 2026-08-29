import prisma from "../../lib/prisma";
import { Prisma, GalleryCategory, MediaType } from "@prisma/client";
import { GalleryQuery } from "./gallery.types";

export class GalleryRepository {
  /**
   * Find galleries with filtering and pagination
   */
  async findMany(query: GalleryQuery) {
    const {
      category,
      type,
      featured,
      page = 1,
      limit = 12,
    } = query;

    const where: Prisma.GalleryWhereInput = {};

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    const [items, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        orderBy: { eventDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gallery.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Find a single gallery by ID with captures
   */
  async findById(id: string) {
    return prisma.gallery.findUnique({
      where: { id },
      include: {
        captures: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }
}

export const galleryRepository = new GalleryRepository();

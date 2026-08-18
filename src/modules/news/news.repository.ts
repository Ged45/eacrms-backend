import { NewsCategory } from "@prisma/client";
import prisma from "../../lib/prisma";

export interface NewsListQuery {
  search?: string;
  category?: NewsCategory;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: "date_desc" | "date_asc";
}

export class NewsRepository {
  async findMany(query: NewsListQuery) {
    const {
      search,
      category,
      featured,
      page = 1,
      limit = 10,
      sort = "date_desc",
    } = query;

    const where: Record<string, unknown> = {
      publishedAt: { not: null },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        select: {
          id: true,
          title: true,
          shortDescription: true,
          category: true,
          imageUrl: true,
          author: true,
          isFeatured: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: sort === "date_asc" ? "asc" : "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    return {
      items: items.map((n) => ({
        id: n.id,
        title: n.title,
        date: n.publishedAt?.toISOString() ?? n.id,
        category: n.category,
        shortDescription: n.shortDescription,
        imageUrl: n.imageUrl,
        author: n.author,
        isFeatured: n.isFeatured,
      })),
      total,
      page,
      limit,
    };
  }

  async findById(id: string) {
    return prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        category: true,
        imageUrl: true,
        insideImages: true,
        author: true,
        isFeatured: true,
        publishedAt: true,
      },
    });
  }
}

export const newsRepository = new NewsRepository();

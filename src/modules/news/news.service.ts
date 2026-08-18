import { Prisma, NewsCategory } from "@prisma/client";
import { newsRepository, NewsListQuery } from "./news.repository";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";
import { cacheGet, cacheInvalidate } from "../../lib/redis";

export class NewsService {
  // ─── Public ─────────────────────────────────────────────────────────────

  async list(query: NewsListQuery) {
    // Cache for 5 minutes. Include query params in key.
    const cacheKey = `news:public:list:${JSON.stringify(query)}`;
    return cacheGet(cacheKey, 300, () => newsRepository.findMany(query));
  }

  async getById(id: string) {
    // Cache for 5 minutes per article.
    const cacheKey = `news:public:detail:${id}`;
    const article = await cacheGet(cacheKey, 300, () => newsRepository.findById(id));
    if (!article) {
      throw new NotFoundError("News article not found.");
    }

    return {
      id: article.id,
      title: article.title,
      date: article.publishedAt?.toISOString() ?? article.id,
      category: article.category,
      shortDescription: article.shortDescription,
      content: article.content,
      imageUrl: article.imageUrl,
      insideImages: article.insideImages,
      author: article.author,
      isFeatured: article.isFeatured,
    };
  }

  // ─── Admin ──────────────────────────────────────────────────────────────

  async listAdmin(query: NewsListQuery) {
    return newsRepository.findManyAdmin(query);
  }

  async create(data: Prisma.NewsCreateInput) {
    const article = await newsRepository.create(data);
    // Invalidate list caches since a new article was added
    await cacheInvalidate("news:public:list:*");
    return article;
  }

  async update(id: string, data: Record<string, unknown>) {
    const existing = await newsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("News article not found.");
    }

    const updates = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    if (Object.keys(updates).length === 0) {
      throw new BadRequestError("No fields to update.");
    }

    const article = await newsRepository.update(id, updates);
    // Invalidate both detail and list caches
    await cacheInvalidate(`news:public:detail:${id}`);
    await cacheInvalidate("news:public:list:*");
    return article;
  }

  async remove(id: string) {
    const existing = await newsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("News article not found.");
    }

    await newsRepository.delete(id);
    // Invalidate caches
    await cacheInvalidate(`news:public:detail:${id}`);
    await cacheInvalidate("news:public:list:*");
    return { message: "News article deleted successfully." };
  }
}

export const newsService = new NewsService();

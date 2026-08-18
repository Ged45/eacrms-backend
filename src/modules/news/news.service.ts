import { NewsCategory } from "@prisma/client";
import { newsRepository, NewsListQuery } from "./news.repository";
import { NotFoundError } from "../../errors/NotFoundError";

export class NewsService {
  async list(query: NewsListQuery) {
    return newsRepository.findMany(query);
  }

  async getById(id: string) {
    const article = await newsRepository.findById(id);
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
}

export const newsService = new NewsService();

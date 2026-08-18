import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { newsService } from "./news.service";
import { NewsCategory } from "@prisma/client";

export class NewsController {
  /**
   * GET /api/v1/news
   * Public endpoint for fan-facing news list
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const category = req.query.category as NewsCategory | undefined;
    const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as "date_desc" | "date_asc") || "date_desc";

    const result = await newsService.list({
      search,
      category,
      featured,
      page,
      limit,
      sort,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  });

  /**
   * GET /api/v1/news/:id
   * Public endpoint for news detail
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const article = await newsService.getById(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: article,
    });
  });
}

export const newsController = new NewsController();

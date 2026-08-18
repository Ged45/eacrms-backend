import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { newsService } from "./news.service";
import { NewsCategory } from "@prisma/client";

export class NewsController {
  // ─── Public Handlers ─────────────────────────────────────────────────────

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

  // ─── Admin Handlers ─────────────────────────────────────────────────────

  /**
   * GET /api/v1/news/admin
   * Admin list — includes unpublished articles.
   */
  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const category = req.query.category as NewsCategory | undefined;
    const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as "date_desc" | "date_asc") || "date_desc";

    const result = await newsService.listAdmin({
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
   * POST /api/v1/news/admin
   * Create a news article.
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const article = await newsService.create(req.body);

    return res.status(201).json({
      success: true,
      message: "News article created successfully.",
      data: article,
    });
  });

  /**
   * PATCH /api/v1/news/admin/:id
   * Update a news article.
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const article = await newsService.update(req.params.id as string, req.body);

    return res.status(200).json({
      success: true,
      message: "News article updated successfully.",
      data: article,
    });
  });

  /**
   * DELETE /api/v1/news/admin/:id
   * Delete a news article.
   */
  remove = asyncHandler(async (req: Request, res: Response) => {
    const result = await newsService.remove(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}

export const newsController = new NewsController();

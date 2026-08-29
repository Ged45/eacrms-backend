import { Request, Response } from "express";
import { galleryService } from "./gallery.service";
import { asyncHandler } from "../../middleware/asyncHandler";

export const galleryController = {
  /**
   * GET /gallery — Public gallery feed
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { category, type, featured, page, limit } = req.query;

    const result = await galleryService.list({
      category: category as any,
      type: type as any,
      featured: featured === "true" ? true : featured === "false" ? false : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  }),

  /**
   * GET /gallery/:id — Gallery album detail
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const gallery = await galleryService.getById(id);

    res.status(200).json({
      success: true,
      data: gallery,
    });
  }),
};

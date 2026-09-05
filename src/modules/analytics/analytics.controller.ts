import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { analyticsService } from "./analytics.service";

export const analyticsController = {
  getDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getDashboard();
    res.json({ success: true, data });
  }),
};

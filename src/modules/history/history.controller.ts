import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { historyService } from "./history.service";

export const historyController = {
  /** Endpoint 4.1: National Athletics Records List */
  getNationalRecords: asyncHandler(async (_req: Request, res: Response) => {
    const data = await historyService.getNationalRecords();
    res.json(data);
  }),

  /** Endpoint 4.2: Past Season Archives List */
  getPastSeasons: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const data = await historyService.getPastSeasons({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(data);
  }),
};

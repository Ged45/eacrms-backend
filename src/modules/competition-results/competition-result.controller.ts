import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { competitionResultService } from "./competition-result.service";

export const competitionResultController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const result = await competitionResultService.create(
      req.params.eventId as string,
      req.body,
      req.user.userId,
      { ipAddress: req.ip, userAgent: req.get("user-agent") || undefined }
    );
    res.status(201).json({ success: true, message: "Results created successfully.", data: result });
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const result = await competitionResultService.publish(
      req.params.eventId as string,
      req.user.userId,
      { ipAddress: req.ip, userAgent: req.get("user-agent") || undefined }
    );
    res.json({ success: true, message: `${result.published} result(s) published.`, data: result });
  }),
};

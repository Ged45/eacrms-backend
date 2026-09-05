import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { applicationService } from "./application.service";
import { ApplicationQueryDTO } from "./application.validation";

export const applicationController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const query: ApplicationQueryDTO = {
      eventId: req.query.eventId as string | undefined,
      type: req.query.type as "ATHLETE" | "CLUB" | undefined,
      status: req.query.status as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await applicationService.findAll(query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  review: asyncHandler(async (req: Request, res: Response) => {
    const application = await applicationService.review(
      req.params.id as string,
      req.body,
      req.user.userId,
      { ipAddress: req.ip, userAgent: req.get("user-agent") || undefined }
    );
    res.json({ success: true, message: "Application reviewed.", data: application });
  }),
};

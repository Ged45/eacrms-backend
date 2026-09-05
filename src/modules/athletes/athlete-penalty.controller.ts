import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { athletePenaltyService } from "./athlete-penalty.service";

export const athletePenaltyController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const penalty = await athletePenaltyService.create(
      req.params.id as string,
      req.body,
      req.user.userId,
      { ipAddress: req.ip, userAgent: req.get("user-agent") || undefined }
    );
    res.status(201).json({ success: true, message: "Penalty issued successfully.", data: penalty });
  }),
};

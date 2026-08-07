import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { eventCheckInService } from "./event-checkin.service";

const metadata = (req: Request) => ({ ipAddress: req.ip, userAgent: req.get("user-agent") ?? undefined });

export const eventCheckInController = {
  generateToken: asyncHandler(async (req: Request, res: Response) => {
    const result = await eventCheckInService.generateToken(req.params.eventId as string, req.body, req.user.userId, metadata(req));
    res.status(201).json({ success: true, message: "QR token generated.", data: result });
  }),
  scan: asyncHandler(async (req: Request, res: Response) => {
    const result = await eventCheckInService.scan(req.params.eventId as string, req.body.token, req.user.userId, metadata(req));
    res.json({ success: true, message: "Attendee checked in.", data: result });
  }),
  list: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await eventCheckInService.listCheckIns(req.params.eventId as string) });
  }),
};

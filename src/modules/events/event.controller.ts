import { Request, Response } from "express";
import { EventStatus } from "@prisma/client";
import { asyncHandler } from "../../middleware/asyncHandler";
import { eventService } from "./event.service";

const metadata = (req: Request) => ({ ipAddress: req.ip, userAgent: req.get("user-agent") ?? undefined });

export const eventController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.create(req.body, req.user.userId, metadata(req));
    res.status(201).json({ success: true, message: "Event created as a draft.", data: event });
  }),
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await eventService.findAll() });
  }),
  findPublished: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await eventService.findPublished() });
  }),
  findById: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await eventService.findById(req.params.id as string) });
  }),
  submit: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.submit(req.params.id as string, req.user.userId, metadata(req));
    res.json({ success: true, message: "Event submitted for federation approval.", data: event });
  }),
  approve: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.approve(req.params.id as string, req.user.userId, metadata(req));
    res.json({ success: true, message: "Event approved and published.", data: event });
  }),
  reject: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.reject(req.params.id as string, req.user.userId, req.body.reason, metadata(req));
    res.json({ success: true, message: "Event rejected.", data: event });
  }),
  overrideStatus: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.overrideStatus(req.params.id as string, req.user.userId, req.body.status as EventStatus, req.body.reason, metadata(req));
    res.json({ success: true, message: "Event status overridden.", data: event });
  }),
};

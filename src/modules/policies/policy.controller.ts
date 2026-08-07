import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { policyService } from "./policy.service";

const metadata = (req: Request) => ({ ipAddress: req.ip, userAgent: req.get("user-agent") ?? undefined });

export const policyController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const policy = await policyService.create(req.body, req.user.userId, metadata(req));
    res.status(201).json({ success: true, message: "Policy created.", data: policy });
  }),
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await policyService.findAll() });
  }),
  findRelevant: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await policyService.findRelevant(req.user.userId) });
  }),
  findById: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await policyService.findById(req.params.id as string) });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const policy = await policyService.update(req.params.id as string, req.body, req.user.userId, metadata(req));
    res.json({ success: true, message: "Policy updated.", data: policy });
  }),
  assign: asyncHandler(async (req: Request, res: Response) => {
    const assignment = await policyService.assign(req.params.id as string, req.body, req.user.userId, metadata(req));
    res.status(201).json({ success: true, message: "Policy assigned.", data: assignment });
  }),
  unassign: asyncHandler(async (req: Request, res: Response) => {
    await policyService.unassign(req.params.id as string, req.params.assignmentId as string, req.user.userId, metadata(req));
    res.json({ success: true, message: "Policy assignment removed." });
  }),
  auditLog: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await policyService.auditLog(req.params.id as string) });
  }),
};

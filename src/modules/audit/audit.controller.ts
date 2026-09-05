import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { auditRepository } from "./audit.repository";
import { ActivityLogQueryDTO } from "./audit.validation";

export const auditController = {
  getLogs: asyncHandler(async (req: Request, res: Response) => {
    const query: ActivityLogQueryDTO = {
      userId: req.query.userId as string | undefined,
      entityType: req.query.entityType as string | undefined,
      severity: req.query.severity as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await auditRepository.findAll(query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  }),
};

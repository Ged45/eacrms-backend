import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { resultService } from "./result.service";

export class ResultController {
  getByEvent = asyncHandler(async (req: Request, res: Response) => {
    const result = await resultService.getByEvent(req.params.eventId as string);
    return res.status(200).json({ success: true, data: result });
  });

  getIncidentsByEvent = asyncHandler(async (req: Request, res: Response) => {
    const incidents = await resultService.getIncidentsByEvent(req.params.eventId as string);
    return res.status(200).json({ success: true, data: incidents });
  });

  updateLiveScore = asyncHandler(async (req: Request, res: Response) => {
    const result = await resultService.updateLiveScore(req.params.eventId as string, {
      ...req.body,
      updatedById: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Live score updated.",
      data: result,
    });
  });

  addIncident = asyncHandler(async (req: Request, res: Response) => {
    const incident = await resultService.addIncident(req.params.eventId as string, {
      ...req.body,
      createdById: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Incident recorded.",
      data: incident,
    });
  });

  certify = asyncHandler(async (req: Request, res: Response) => {
    const result = await resultService.certify(req.params.eventId as string, {
      ...req.body,
      certifiedById: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Result certified by federation.",
      data: result,
    });
  });
}

export const resultController = new ResultController();

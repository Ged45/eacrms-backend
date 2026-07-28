import { Request, Response } from "express";
import { AthleteStatus } from "@prisma/client";

import { coachService } from "./coach.service";
import { asyncHandler } from "../../middleware/asyncHandler";

export class CoachController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await coachService.register(req.body, req);
    return res.status(201).json({ success: true, message: result.message, data: result.coach });
  });

  registerByClubAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await coachService.register(req.body, req, {
      registeredById: req.user.userId,
    });
    return res.status(201).json({ success: true, message: result.message, data: result.coach });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const coach = await coachService.getByUserId(req.user.userId);
    return res.status(200).json({ success: true, data: coach });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const coach = await coachService.getById(req.params.id as string);
    return res.status(200).json({ success: true, data: coach });
  });

  findAll = asyncHandler(async (_req: Request, res: Response) => {
    const coaches = await coachService.findAll();
    return res.status(200).json({ success: true, data: coaches });
  });

  findByStatus = asyncHandler(async (req: Request, res: Response) => {
    const coaches = await coachService.findByStatus(req.params.status as AthleteStatus);
    return res.status(200).json({ success: true, data: coaches });
  });

  findByClub = asyncHandler(async (req: Request, res: Response) => {
    const coaches = await coachService.findByClub(req.params.clubId as string);
    return res.status(200).json({ success: true, data: coaches });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const result = await coachService.delete(req.params.id as string);
    return res.status(200).json({ success: true, message: result.message });
  });
}

export const coachController = new CoachController();

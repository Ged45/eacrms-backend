import { Request, Response } from "express";
import { faydaService } from "./fayda.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BadRequestError } from "../../errors/BadRequestError";

export const faydaController = {
  /**
   * POST /api/v1/athletes/:athleteId/fayda/initiate
   */
  initiateForAthlete: asyncHandler(async (req: Request, res: Response) => {
    const result = await faydaService.initiateForAthlete(
      req.params.athleteId as string,
      req.body.nin,
      req.user.userId
    );
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * POST /api/v1/coaches/:coachId/fayda/initiate
   */
  initiateForCoach: asyncHandler(async (req: Request, res: Response) => {
    const result = await faydaService.initiateForCoach(
      req.params.coachId as string,
      req.body.nin,
      req.user.userId
    );
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * POST /api/v1/fayda/verify/:verificationId/confirm
   */
  confirmOtp: asyncHandler(async (req: Request, res: Response) => {
    const result = await faydaService.confirmOtp(
      req.params.verificationId as string,
      req.body.otp,
      req.user.userId
    );
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * GET /api/v1/athletes/:athleteId/fayda/status
   */
  getAthleteStatus: asyncHandler(async (req: Request, res: Response) => {
    const result = await faydaService.getStatusForAthlete(
      req.params.athleteId as string
    );
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * GET /api/v1/coaches/:coachId/fayda/status
   */
  getCoachStatus: asyncHandler(async (req: Request, res: Response) => {
    const result = await faydaService.getStatusForCoach(
      req.params.coachId as string
    );
    return res.status(200).json({ success: true, data: result });
  }),
};

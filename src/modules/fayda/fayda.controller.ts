import { Request, Response } from "express";
import { faydaService } from "./fayda.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BadRequestError } from "../../errors/BadRequestError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { verifyFaydaVerificationToken } from "../../utils/auth-contract";

export const faydaController = {
  /**
   * POST /api/v1/fayda/initiate
   */
  initiateStateless: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as { nin?: string; FAN?: string };
    const result = await faydaService.initiateStateless(body.nin ?? body.FAN ?? "", "system");
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * POST /api/v1/fayda/verify/confirm
   */
  confirmStatelessOtp: asyncHandler(async (req: Request, res: Response) => {
    const result = await faydaService.confirmStatelessOtp(
      req.body.verificationId as string | undefined,
      req.body.otp as string | undefined,
      "system"
    );
    return res.status(200).json({ success: true, data: result });
  }),

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
   * GET /api/v1/fayda/verify/:verificationId
   * Public endpoint to fetch verification status and demographic data
   */
  getVerification: asyncHandler(async (req: Request, res: Response) => {
    const verificationId = req.params.verificationId as string;
    const token = (req.query.token as string) || req.get("x-fayda-token") || undefined;

    if (!token) throw new BadRequestError("Fayda verification token is required.");

    // validate token
    let payload;
    try {
      payload = verifyFaydaVerificationToken(token);
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired Fayda verification token.");
    }

    const result = await faydaService.getVerificationById(verificationId);

    if (result.status !== "CONFIRMED") {
      throw new BadRequestError("Verification is not confirmed yet.");
    }

    // Ensure the token corresponds to the same NIN
    if (payload.nin !== result.nin) {
      throw new UnauthorizedError("Token does not match verification record.");
    }

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

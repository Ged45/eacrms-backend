import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { verificationService } from "./verification.service";

export const verificationController = {
  /**
   * POST /auth/verify/email
   * Public — user submits { email, code }
   */
  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const result = await verificationService.verifyEmail(
      req.body.email,
      req.body.code
    );
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * POST /auth/verify/phone/request
   * Authenticated — sends OTP to the user's registered phone
   */
  requestPhoneOtp: asyncHandler(async (req: Request, res: Response) => {
    const result = await verificationService.requestPhoneOtp(req.user.userId);
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * POST /auth/verify/phone
   * Authenticated — user submits { otp }
   */
  verifyPhone: asyncHandler(async (req: Request, res: Response) => {
    const result = await verificationService.verifyPhone(
      req.user.userId,
      req.body.otp
    );
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * POST /auth/verify/resend
   * Authenticated — resend email or phone code
   */
  resend: asyncHandler(async (req: Request, res: Response) => {
    const result = await verificationService.resend(
      req.user.userId,
      req.body.type
    );
    return res.status(200).json({ success: true, data: result });
  }),

  /**
   * GET /auth/verify/status
   * Authenticated — check verification status
   */
  getStatus: asyncHandler(async (req: Request, res: Response) => {
    const result = await verificationService.getStatus(req.user.userId);
    return res.status(200).json({ success: true, data: result });
  }),
};

import { Request, Response } from "express";
import type { PaymentStatus } from "@prisma/client";
import { asyncHandler } from "../../middleware/asyncHandler";
import { paymentService } from "./payment.service";

const metadata = (req: Request) => ({ ipAddress: req.ip, userAgent: req.get("user-agent") ?? undefined });

export const paymentController = {
  createEventRegistration: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.createEventRegistration(req.params.eventId as string, req.body, req.user.userId, metadata(req));
    res.status(201).json({ success: true, message: "Registration created. Payment is pending.", data: result });
  }),
  status: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await paymentService.findStatus(req.params.paymentId as string, req.user.userId) });
  }),
  history: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await paymentService.historyForUser(req.user.userId) });
  }),
  mockWebhook: asyncHandler(async (req: Request, res: Response) => {
    paymentService.verifyWebhookSecret(req.get("x-mock-payment-secret") ?? undefined);
    const result = await paymentService.processMockWebhook(req.body.reference, req.body.status as 'PAID' | 'FAILED', req.body.transactionId, req.body, metadata(req));
    res.json({ success: true, message: "Mock payment callback processed.", data: result });
  }),
};

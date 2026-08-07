import { z } from "zod";

export const createEventRegistrationSchema = z.object({
  athleteId: z.string().min(1),
  amount: z.number().positive().max(1_000_000),
  currency: z.string().length(3).default("ETB"),
});

export const mockPaymentWebhookSchema = z.object({
  reference: z.string().min(1),
  status: z.enum(["PAID", "FAILED"]),
  transactionId: z.string().min(3).max(160),
});

export type CreateEventRegistrationDTO = z.infer<typeof createEventRegistrationSchema>;

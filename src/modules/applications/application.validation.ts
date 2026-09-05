import { z } from "zod";

export const applicationQuerySchema = z.object({
  eventId: z.string().optional(),
  type: z.enum(["ATHLETE", "CLUB"]).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CHANGES_REQUESTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ApplicationQueryDTO = z.infer<typeof applicationQuerySchema>;

export const reviewApplicationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED"]),
  reviewNote: z.string().max(2000).optional(),
});

export type ReviewApplicationDTO = z.infer<typeof reviewApplicationSchema>;

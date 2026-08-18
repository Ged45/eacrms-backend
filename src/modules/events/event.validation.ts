import { z } from "zod";

const scheduleItemSchema = z.object({
  title: z.string().min(1).max(160),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  description: z.string().max(2000).optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(5000).optional(),
  category: z.string().min(2).max(100),
  rules: z.string().min(1).max(10000),
  schedule: z.array(scheduleItemSchema).min(1),
  venue: z.string().min(2).max(300).optional(),
  organizerName: z.string().min(2).max(160),
  organizerEmail: z.string().email().optional(),
  organizerPhone: z.string().min(5).max(30).optional(),
  disciplines: z.array(z.string().min(1).max(100)).optional(),
  bannerUrl: z.string().url().max(2000).optional(),
  registrationDeadline: z.string().datetime().optional(),
});

export const statusReasonSchema = z.object({
  reason: z.string().min(3).max(1000),
});

export const overrideEventStatusSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "CANCELLED"]),
  reason: z.string().min(3).max(1000),
});

export type CreateEventDTO = z.infer<typeof createEventSchema>;

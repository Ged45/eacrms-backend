import { z } from "zod";

export const activityLogQuerySchema = z.object({
  userId: z.string().optional(),
  entityType: z.string().optional(),
  severity: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ActivityLogQueryDTO = z.infer<typeof activityLogQuerySchema>;

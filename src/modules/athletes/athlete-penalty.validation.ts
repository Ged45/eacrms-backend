import { z } from "zod";

export const createPenaltySchema = z.object({
  type: z.enum(["Warning", "Fine", "Restriction", "Suspension"]),
  reason: z.string().min(3).max(2000),
  severity: z.enum(["low", "medium", "high"]),
});

export type CreatePenaltyDTO = z.infer<typeof createPenaltySchema>;

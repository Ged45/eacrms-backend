import { z } from "zod";

const resultEntrySchema = z.object({
  athleteId: z.string().min(1),
  bibNo: z.string().optional(),
  position: z.number().int().min(1),
  mark: z.string().min(1),
  flag: z.enum(["OK", "DQ", "DNF", "DNS"]).optional(),
  medal: z.enum(["GOLD", "SILVER", "BRONZE"]).nullable().optional(),
  personalBest: z.boolean().default(false),
  seasonBest: z.boolean().default(false),
  remarks: z.string().max(500).optional(),
});

export const createCompetitionResultSchema = z.object({
  categoryId: z.string().min(1),
  discipline: z.string().min(1),
  entries: z.array(resultEntrySchema).min(1),
});

export type CreateCompetitionResultDTO = z.infer<typeof createCompetitionResultSchema>;

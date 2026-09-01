import { z } from "zod";

export const liveResultStatusSchema = z.enum(["SCHEDULED", "LIVE", "FINAL", "CERTIFIED", "REJECTED"]);

export const createResultVersionSchema = z.object({
  status: z.enum(["SCHEDULED", "LIVE", "FINAL"]).default("LIVE"),
  homeScore: z.number().int().min(0).default(0),
  awayScore: z.number().int().min(0).default(0),
  notes: z.string().max(1000).optional(),
  updatedByRole: z.string().max(80).optional(),
});

export const createIncidentSchema = z.object({
  type: z.enum(["SCORE_CHANGE", "PENALTY", "WARNING", "DISQUALIFICATION", "INJURY", "OTHER"]),
  description: z.string().min(3).max(1000),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  relatedPlayer: z.string().max(120).optional(),
  relatedTeam: z.string().max(120).optional(),
});

export const certifyResultSchema = z.object({
  certified: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

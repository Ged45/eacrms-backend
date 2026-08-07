import { z } from "zod";

export const generateQrTokenSchema = z.object({
  attendeeType: z.enum(["ATHLETE", "CLUB"]),
  attendeeId: z.string().min(1),
  expiresInMinutes: z.number().int().min(1).max(10080).optional().default(1440),
});

export const scanQrTokenSchema = z.object({
  token: z.string().min(32).max(200),
});

export type GenerateQrTokenDTO = z.infer<typeof generateQrTokenSchema>;

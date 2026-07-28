import { z } from "zod";

export const createCoachSchema = z.object({
  firstName:         z.string().min(2).max(50),
  lastName:          z.string().min(2).max(50),
  email:             z.string().email(),
  password:          z.string().min(8),
  phoneNumber:       z.string().optional(),
  sportId:           z.string().optional(),
  clubId:            z.string().optional(),
  licenseNumber:     z.string().optional(),
  specialization:    z.string().optional(),
  yearsOfExperience: z.number().int().min(0).max(60).optional(),
});

import { z } from "zod";

export const registerClubSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100),

  shortName: z
    .string()
    .max(20)
    .optional(),

  email: z
    .string()
    .email()
    .optional(),

  phone: z
    .string()
    .optional(),

  address: z
    .string()
    .optional(),

  city: z
    .string()
    .optional(),

  region: z
    .string()
    .optional(),

  licenseNumber: z
    .string()
    .optional(),

  logoUrl: z
    .string()
    .url()
    .optional(),
});

export const rejectClubSchema = z.object({
  reason: z
    .string()
    .min(5)
    .max(500),
});
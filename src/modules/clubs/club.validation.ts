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

export const registerClubAdminSchema = z.object({
  // User fields
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  firstName: z
    .string()
    .trim()
    .min(2, "First name is required")
    .max(50),
  lastName: z
    .string()
    .trim()
    .min(2)
    .max(50),
  phoneNumber: z.string().trim().min(7, "Invalid phone number").optional(),

  // Club fields
  clubName: z
    .string()
    .min(3, "Club name must be at least 3 characters")
    .max(100),
  clubShortName: z.string().max(20).optional(),
  clubEmail: z.string().email().optional(),
  clubPhone: z.string().optional(),
  clubAddress: z.string().optional(),
  clubCity: z.string().optional(),
  clubRegion: z.string().optional(),
  licenseNumber: z.string().optional(),
  logoUrl: z.string().url().optional(),
}).refine((data) => data.email || data.phoneNumber, {
  message: "Email or phone number is required.",
  path: ["email"],
});

export const rejectClubSchema = z.object({
  reason: z
    .string()
    .min(5)
    .max(500),
});
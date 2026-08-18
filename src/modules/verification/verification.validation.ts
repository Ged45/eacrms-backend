import { z } from "zod";

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code:  z.string().length(6, "Code must be 6 digits"),
});

export const verifyPhoneSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const phoneVerificationSchema = z.object({
  phoneNumber: z.string().trim().min(7, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resendSchema = z.object({
  type: z.enum(["EMAIL", "PHONE"]),
});

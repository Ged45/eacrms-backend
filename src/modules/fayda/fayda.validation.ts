import { z } from "zod";

export const initiateVerificationSchema = z.object({
  nin: z.string().min(6).max(36),
});

export const confirmOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

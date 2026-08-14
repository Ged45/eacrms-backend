import { z } from "zod";

export const initiateVerificationSchema = z.object({
  nin: z.string().min(6).max(36).optional(),
  FAN: z.string().min(6).max(36).optional(),
}).refine((data) => data.nin || data.FAN, {
  message: "Either nin or FAN is required.",
  path: ["nin"],
}).transform((data) => ({
  nin: data.nin ?? data.FAN!,
}));

export const confirmOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
  verificationId: z.string().min(1).optional(),
}).refine((data) => !!data.otp || !!data.verificationId, {
  message: "Either otp or verificationId is required.",
  path: ["otp"],
});

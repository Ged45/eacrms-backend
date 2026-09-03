import { z } from "zod";
export const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .optional(),

  password: z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long"),

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

  /**
   * Optional — which contact method to verify immediately after registration.
   * "email" → sends email verification code
   * "phone" → sends SMS OTP
   * If omitted, defaults to "email" when email is provided, otherwise "phone".
   */
  verificationMethod: z.enum(["email", "phone"]).optional(),
}).refine((data) => data.email || data.phoneNumber, {
  message: "Email or phone number is required.",
  path: ["email"],
});

export const LoginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or phone number is required.").optional(),
  email: z.string().trim().toLowerCase().email("Invalid email address").optional(),

  password: z
    .string()
    .min(1, "Password is required"),
}).refine((data) => data.identifier || data.email, {
  message: "Email or phone number is required.",
  path: ["identifier"],
}).transform((data) => ({
  identifier: data.identifier ?? data.email!,
  password: data.password,
}));

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
  phoneNumber: z.string().trim().min(7, "Invalid phone number").optional(),
  identifier: z.string().trim().min(1, "Email or phone number is required.").optional(),
}).refine((data) => data.identifier || data.email || data.phoneNumber, {
  message: "Email or phone number is required.",
  path: ["identifier"],
}).transform((data) => ({
  identifier: data.identifier ?? data.email ?? data.phoneNumber!,
}));

export const ResetPasswordSchema = z.object({
  identifier: z.string().trim().min(1, "Email or phone number is required."),
  code: z.string().length(6, "Verification code must be 6 digits"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
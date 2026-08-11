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
}).refine((data) => data.email || data.phoneNumber, {
  message: "Email or phone number is required.",
  path: ["email"],
});

export const LoginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or phone number is required."),

  password: z
    .string()
    .min(1, "Password is required"),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
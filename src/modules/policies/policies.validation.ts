import { z } from "zod";
import { PolicyScope, PolicyStatus } from "@prisma/client";

const policyRulesSchema = z.record(z.string(), z.unknown());

export const createPolicySchema = z.object({
  code: z
    .string({ message: "Policy code is required" })
    .trim()
    .min(2, "Policy code must be at least 2 characters"),

  title: z
    .string({ message: "Policy title is required" })
    .trim()
    .min(2, "Policy title must be at least 2 characters"),

  description: z
    .string()
    .trim()
    .optional(),

  scope: z.nativeEnum(PolicyScope, {
    message: "Policy scope is required",
  }),

  status: z
    .nativeEnum(PolicyStatus)
    .optional(),

  rules: policyRulesSchema,
});

export const updatePolicySchema = z.object({
  code: z.string().trim().min(2).optional(),
  title: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  scope: z.nativeEnum(PolicyScope).optional(),
  status: z.nativeEnum(PolicyStatus).optional(),
  rules: policyRulesSchema.optional(),
});

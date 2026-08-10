import { z } from "zod";
import { PolicyType, PolicyScope, PolicyStatus } from "@prisma/client";

export const createPolicySchema = z.object({
  body: z.object({
    name: z.string({ message: "Policy name is required" }).min(2),
    description: z.string().optional(),
    type: z.nativeEnum(PolicyType, { message: "Policy type is required" }),
    content: z.string({ message: "Policy content is required" }),
    scope: z.nativeEnum(PolicyScope, { message: "Policy scope is required" }),
    effectiveFrom: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
    effectiveTo: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  }),
});

export const updatePolicySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    type: z.nativeEnum(PolicyType).optional(),
    content: z.string().optional(),
    scope: z.nativeEnum(PolicyScope).optional(),
    status: z.nativeEnum(PolicyStatus).optional(),
    effectiveFrom: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
    effectiveTo: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  }),
});
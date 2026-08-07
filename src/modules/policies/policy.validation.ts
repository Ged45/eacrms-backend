import { z } from "zod";

const policyRulesSchema = z.object({
  blocked: z.boolean().optional(),
  requiredPermissions: z.array(z.string().min(1)).optional(),
  minimumAge: z.number().int().min(0).max(120).optional(),
  maximumAge: z.number().int().min(0).max(120).optional(),
}).catchall(z.unknown());

export const createPolicySchema = z.object({
  code: z.string().trim().min(3).max(80).regex(/^[A-Z0-9_:-]+$/, "Use uppercase letters, numbers, underscores, colons, or hyphens."),
  title: z.string().min(3).max(160),
  description: z.string().max(4000).optional(),
  scope: z.enum(["CLUB", "EVENT", "ATHLETE_PARTICIPATION"]),
  rules: policyRulesSchema,
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updatePolicySchema = createPolicySchema
  .omit({ code: true, scope: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");

export const assignPolicySchema = z.object({
  clubId: z.string().min(1).optional(),
  eventId: z.string().min(1).optional(),
}).refine((value) => Number(Boolean(value.clubId)) + Number(Boolean(value.eventId)) === 1, {
  message: "Assign the policy to exactly one club or event.",
});

export type CreatePolicyDTO = z.infer<typeof createPolicySchema>;
export type UpdatePolicyDTO = z.infer<typeof updatePolicySchema>;
export type AssignPolicyDTO = z.infer<typeof assignPolicySchema>;

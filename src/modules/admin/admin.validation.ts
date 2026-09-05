import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(30).optional(),
  role: z.string().min(1),
  department: z.string().max(100).optional(),
  permissions: z.array(z.string()).optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(5).max(30).optional(),
  role: z.string().optional(),
  department: z.string().max(100).optional(),
  permissions: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

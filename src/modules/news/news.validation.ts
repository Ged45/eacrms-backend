import { z } from "zod";

const newsCategories = [
  "CHAMPIONSHIP",
  "TRAINING",
  "ANNOUNCEMENT",
  "COMMUNITY",
  "RECOGNITION",
  "GENERAL",
] as const;

export const createNewsSchema = z.object({
  title: z.string().min(1).max(300),
  shortDescription: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.enum(newsCategories).default("GENERAL"),
  imageUrl: z.string().url().max(2000).nullable().optional(),
  insideImages: z.array(z.string().url()).max(10).optional(),
  author: z.string().max(200).optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
});

export const updateNewsSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  shortDescription: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(newsCategories).optional(),
  imageUrl: z.string().url().max(2000).nullable().optional(),
  insideImages: z.array(z.string().url()).max(10).optional(),
  author: z.string().max(200).optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;

import { z } from "zod";

export const contactSubjectEnum = [
  "GENERAL_INQUIRY",
  "ATHLETE_REGISTRATION",
  "CLUB_REGISTRATION",
  "EVENT_INQUIRY",
  "PAYMENT_ISSUE",
  "TECHNICAL_SUPPORT",
  "MEDIA_INQUIRY",
  "PARTNERSHIP",
  "COMPLAINT",
  "FEEDBACK",
] as const;

export const relatedToEnum = ["ATHLETE", "CLUB", "EVENT", "USER", "GENERAL"] as const;

export const contactSubmissionSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.email("Invalid email."),
  phone: z.string().min(3).max(30).optional(),
  subject: z.enum(contactSubjectEnum),
  message: z.string().min(10).max(2000),
  relatedTo: z.enum(relatedToEnum).optional(),
  relatedId: z.string().min(1).max(200).optional(),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_REVIEW", "RESPONDED", "RESOLVED", "CLOSED"]),
  adminNotes: z.string().max(2000).nullable().optional(),
  respond: z.boolean().optional(),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;

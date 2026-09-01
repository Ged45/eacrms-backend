export type ContactStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "RESPONDED"
  | "RESOLVED"
  | "CLOSED";

export type ContactSubject =
  | "GENERAL_INQUIRY"
  | "ATHLETE_REGISTRATION"
  | "CLUB_REGISTRATION"
  | "EVENT_INQUIRY"
  | "PAYMENT_ISSUE"
  | "TECHNICAL_SUPPORT"
  | "MEDIA_INQUIRY"
  | "PARTNERSHIP"
  | "COMPLAINT"
  | "FEEDBACK";

export interface ContactSubmissionRecord {
  id: string;
  referenceNumber: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: ContactSubject;
  message: string;
  relatedTo?: string | null;
  relatedId?: string | null;
  status: ContactStatus;
  adminNotes?: string | null;
  respondedAt?: Date | null;
  respondedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

import { z } from "zod";

/**
 * Schema for self-registration (mobile/web flow).
 * The Fayda verification token is required — firstName, lastName,
 * dateOfBirth, gender, nationality, and fanNumber are extracted
 * server-side from the token so the client cannot tamper with them.
 */
export const createAthleteSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string().optional(),

    faydaVerificationToken: z.string().min(1, "Fayda verification token is required."),
    fanNumber: z.string().optional(),

    sportIds: z.array(z.string().min(1)).optional(),
    sportId: z.string().optional(),

    clubId: z.string().optional(),
    clubName: z.string().optional(),
    region: z.string().optional(),
    height: z.number().min(40).max(250).optional(),
    weight: z.number().min(10).max(400).optional(),
    emergencyContactPhone: z.string().optional(),

    // Fields accepted but extracted from Fayda token server-side
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    nationality: z.string().min(2).optional(),

    position: z.string().optional(),
    dominantHand: z.enum(["LEFT", "RIGHT", "AMBIDEXTROUS"]).optional(),
    dominantFoot: z.enum(["LEFT", "RIGHT", "BOTH"]).optional(),
    bloodType: z.enum([
        "A_POSITIVE", "A_NEGATIVE",
        "B_POSITIVE", "B_NEGATIVE",
        "AB_POSITIVE", "AB_NEGATIVE",
        "O_POSITIVE", "O_NEGATIVE",
    ]).optional(),
});

/**
 * Schema for club-admin registration.
 * Admin supplies the athlete's personal data directly.
 */
export const createAthleteByAdminSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string().optional(),
    dateOfBirth: z.coerce.date(),
    gender: z.enum(["MALE", "FEMALE"]),
    nationality: z.string().min(2),
    sportIds: z.array(z.string().min(1)).optional(),
    sportId: z.string().optional(),
    clubId: z.string().optional(),
    clubName: z.string().optional(),
    region: z.string().optional(),
    height: z.number().min(40).max(250).optional(),
    weight: z.number().min(10).max(400).optional(),
    emergencyContactPhone: z.string().optional(),
    position: z.string().optional(),
    dominantHand: z.enum(["LEFT", "RIGHT", "AMBIDEXTROUS"]).optional(),
    dominantFoot: z.enum(["LEFT", "RIGHT", "BOTH"]).optional(),
    bloodType: z.enum([
        "A_POSITIVE", "A_NEGATIVE",
        "B_POSITIVE", "B_NEGATIVE",
        "AB_POSITIVE", "AB_NEGATIVE",
        "O_POSITIVE", "O_NEGATIVE",
    ]).optional(),
});

export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;
export type CreateAthleteByAdminInput = z.infer<typeof createAthleteByAdminSchema>;

// ─── Dashboard Endpoints ─────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
    primaryEvent: z.string().optional(),
    region: z.string().optional(),
    clubName: z.string().optional(),
    clubId: z.string().optional(),
    height: z.number().min(40).max(250).optional(),
    weight: z.number().min(10).max(400).optional(),
    photoUrl: z.string().url().max(2000).optional(),
    amharicName: z.string().max(100).optional(),
});

export const createPersonalBestSchema = z.object({
    event: z.string().min(1).max(100),
    mark: z.string().min(1).max(50),
    date: z.coerce.date().optional(),
    venue: z.string().max(200).optional(),
    scope: z.enum(["ALL_TIME", "SEASON"]).optional(),
});

export const createTrainingLogSchema = z.object({
    date: z.coerce.date(),
    type: z.string().min(1).max(100),
    distanceKm: z.number().min(0),
    durationMinutes: z.number().int().min(0),
    notes: z.string().max(2000).optional(),
});

export const createWeightLogSchema = z.object({
    date: z.coerce.date(),
    weightKg: z.number().min(10).max(500),
});
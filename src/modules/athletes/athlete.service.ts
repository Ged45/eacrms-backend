import { Request } from "express";
import bcrypt from "bcrypt";
import { RegistrationSource, AthleteStatus } from "@prisma/client";

import { athleteRepository } from "./athlete.repository";
import { AthleteRegistrationInput, CreateAthleteDTO } from "./dto/create-athlete.dto";

import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";

import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";

import {
  verifyFaydaVerificationToken,
  FaydaVerificationTokenPayload,
} from "../../utils/auth-contract";

const SALT_ROUNDS = 12;

export class AthleteService {
  /**
   * Register a new athlete.
   *
   * Self-registration (mobile/web flow):
   *   - `faydaVerificationToken` is required.
   *   - firstName, lastName, dateOfBirth, gender are extracted from the token.
   *   - Response matches the mobile contract: { success, message, data: { id, status, createdAt } }.
   *
   * Club-admin registration:
   *   - Personal data is supplied directly in the request body.
   *   - faydaVerificationToken is optional.
   */
  async register(
    data: CreateAthleteDTO,
    request: Request,
    options?: { registeredById?: string }
  ) {
    const registeredById = options?.registeredById;
    const isSelfRegistration = !registeredById;

    // ── Self-registration: validate Fayda token ──────────────────────────
    let demographics: FaydaVerificationTokenPayload | null = null;

    if (isSelfRegistration) {
      if (!data.faydaVerificationToken) {
        throw new BadRequestError("Fayda verification token is required for self-registration.");
      }

      try {
        demographics = verifyFaydaVerificationToken(data.faydaVerificationToken);
      } catch {
        throw new BadRequestError("Invalid or expired Fayda verification token.");
      }
    }

    // ── Merge demographics from token (self-reg) or body (admin-reg) ─────
    const firstName = demographics?.firstName ?? data.firstName;
    const lastName = demographics?.lastName ?? data.lastName;
    const dateOfBirth = demographics?.dateOfBirth
      ? new Date(demographics.dateOfBirth)
      : data.dateOfBirth;
    const gender = demographics?.gender ?? data.gender;
    const fanNumber = demographics?.fanNumber ?? data.fanNumber;

    // nationality is not in the Fayda token; accept from body or default
    const nationality = data.nationality ?? "Ethiopian";

    if (!data.email || !data.password || !firstName || !lastName || !dateOfBirth || !gender) {
      throw new BadRequestError("Missing required athlete registration fields.");
    }

    // ── Check duplicate email ─────────────────────────────────────────────
    const existingUser = await athleteRepository.emailExists(data.email);
    if (existingUser) {
      throw new ConflictError("Email already exists.");
    }

    // ── Validate sportIds (each must exist) ──────────────────────────────
    const sportIds = data.sportIds ?? (data.sportId ? [data.sportId] : []);

    for (const sid of sportIds) {
      const sport = await athleteRepository.sportExists(sid);
      if (!sport) {
        throw new NotFoundError(`Sport not found: ${sid}`);
      }
    }

    // ── Validate club ─────────────────────────────────────────────────────
    if (data.clubId) {
      const club = await athleteRepository.clubExists(data.clubId);
      if (!club) {
        throw new NotFoundError("Club not found.");
      }
    }

    // ── Hash password ─────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // ── Build registration payload ────────────────────────────────────────
    const registrationSource: RegistrationSource = registeredById
      ? RegistrationSource.CLUB_ADMIN
      : RegistrationSource.SELF;

    const athletePayload: AthleteRegistrationInput = {
      firstName,
      lastName,
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber ?? demographics?.phoneNumber,
      dateOfBirth,
      gender,
      nationality,
      sportIds,
      sportId: sportIds[0],
      clubId: data.clubId,
      clubName: data.clubName,
      region: data.region,
      emergencyContactPhone: data.emergencyContactPhone,
      height: data.height,
      weight: data.weight,
      position: data.position,
      dominantHand: data.dominantHand,
      dominantFoot: data.dominantFoot,
      bloodType: data.bloodType,
      faydaVerificationToken: data.faydaVerificationToken,
      fanNumber,
      registrationSource,
      registeredById,
    };

    const athlete = await athleteRepository.register(athletePayload);
    if (!athlete) {
      throw new BadRequestError("Failed to create athlete record.");
    }

    // ── Audit log ─────────────────────────────────────────────────────────
    await auditService.log({
      userId: athlete.user.id,
      action: AuditActions.REGISTER,
      entity: "Athlete",
      entityId: athlete.id,
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? "",
      details: {
        email: athlete.user.email,
        sportIds,
        clubId: athlete.clubId,
        registrationSource,
      },
    });

    // ── Mobile contract response ──────────────────────────────────────────
    return {
      message:
        isSelfRegistration
          ? "Your registration is under review. You will receive an email once approved."
          : "Athlete registered successfully.",
      athlete: {
        id: athlete.id,
        status: athlete.status,
        createdAt: athlete.createdAt,
      },
    };
  }

  /**
   * Get athlete by athlete ID
   */
  async getById(id: string) {
    const athlete = await athleteRepository.findById(id);
    if (!athlete) {
      throw new NotFoundError("Athlete not found.");
    }

    const { password, ...user } = athlete.user;
    return { ...athlete, user };
  }

  /**
   * Get athlete by authenticated user
   */
  async getByUserId(userId: string) {
    const athlete = await athleteRepository.findByUserId(userId);
    if (!athlete) {
      throw new NotFoundError("Athlete profile not found.");
    }

    const { password, ...user } = athlete.user;
    return { ...athlete, user };
  }

  /**
   * List all athletes
   */
  async findAll() {
    const athletes = await athleteRepository.findAll();
    return athletes.map((athlete) => {
      const { password, ...user } = athlete.user;
      return { ...athlete, user };
    });
  }

  /**
   * Search athletes
   */
  async search(search: string) {
    const athletes = await athleteRepository.search(search);
    return athletes.map((athlete) => {
      const { password, ...user } = athlete.user;
      return { ...athlete, user };
    });
  }

  /**
   * Get athletes by status
   */
  async findByStatus(status: AthleteStatus) {
    const athletes = await athleteRepository.findByStatus(status);
    return athletes.map((athlete) => {
      const { password, ...user } = athlete.user;
      return { ...athlete, user };
    });
  }

  /**
   * Approve athlete — sets AthleteStatus to APPROVED and User to ACTIVE so they can login
   */
  async approve(id: string, adminId: string) {
    const athlete = await athleteRepository.findById(id);
    if (!athlete) throw new NotFoundError("Athlete not found.");

    if (athlete.status === "APPROVED" || athlete.status === "ACTIVE") {
      throw new BadRequestError("Athlete is already approved.");
    }

    if (athlete.status === "REJECTED") {
      throw new BadRequestError("Cannot approve a rejected athlete.");
    }

    const updated = await athleteRepository.updateStatus(id, "APPROVED");
    await athleteRepository.activateUser(athlete.userId);

    await auditService.log({
      userId: adminId,
      action: AuditActions.APPROVE_ATHLETE,
      entity: "Athlete",
      entityId: id,
      details: { previousStatus: athlete.status },
    });

    const { password, ...user } = updated.user;
    return { message: "Athlete approved. Account is now active.", athlete: { ...updated, user } };
  }

  /**
   * Reject athlete — sets AthleteStatus to REJECTED, User stays PENDING
   */
  async reject(id: string, adminId: string, reason: string) {
    const athlete = await athleteRepository.findById(id);
    if (!athlete) throw new NotFoundError("Athlete not found.");

    if (athlete.status === "REJECTED") {
      throw new BadRequestError("Athlete is already rejected.");
    }

    const updated = await athleteRepository.updateStatus(id, "REJECTED");

    await auditService.log({
      userId: adminId,
      action: AuditActions.REJECT_ATHLETE,
      entity: "Athlete",
      entityId: id,
      details: { reason, previousStatus: athlete.status },
    });

    const { password, ...user } = updated.user;
    return { message: "Athlete rejected.", athlete: { ...updated, user } };
  }

  /**
   * Set athlete status to ACTIVE (fully active member, after approval)
   */
  async activate(id: string, adminId: string) {
    const athlete = await athleteRepository.findById(id);
    if (!athlete) throw new NotFoundError("Athlete not found.");

    if (athlete.status !== "APPROVED") {
      throw new BadRequestError("Athlete must be APPROVED before being set to ACTIVE.");
    }

    const updated = await athleteRepository.updateStatus(id, "ACTIVE");

    await auditService.log({
      userId: adminId,
      action: AuditActions.ACTIVATE_ATHLETE,
      entity: "Athlete",
      entityId: id,
    });

    const { password, ...user } = updated.user;
    return { message: "Athlete is now ACTIVE.", athlete: { ...updated, user } };
  }

  /**
   * Suspend athlete — sets AthleteStatus to SUSPENDED and deactivates User
   */
  async suspend(id: string, adminId: string, reason?: string) {
    const athlete = await athleteRepository.findById(id);
    if (!athlete) throw new NotFoundError("Athlete not found.");

    if (athlete.status === "SUSPENDED") {
      throw new BadRequestError("Athlete is already suspended.");
    }

    const updated = await athleteRepository.updateStatus(id, "SUSPENDED");
    await athleteRepository.deactivateUser(athlete.userId);

    await auditService.log({
      userId: adminId,
      action: AuditActions.SUSPEND_ATHLETE,
      entity: "Athlete",
      entityId: id,
      details: { reason, previousStatus: athlete.status },
    });

    const { password, ...user } = updated.user;
    return { message: "Athlete suspended.", athlete: { ...updated, user } };
  }

  /**
   * Delete athlete
   */
  async delete(id: string) {
    const athlete = await athleteRepository.findById(id);
    if (!athlete) {
      throw new NotFoundError("Athlete not found.");
    }

    await athleteRepository.delete(id);

    await auditService.log({
      userId: athlete.user.id,
      action: AuditActions.DELETE_ATHLETE,
      entity: "Athlete",
      entityId: athlete.id,
    });

    return { message: "Athlete deleted successfully." };
  }

  // ─── Dashboard Methods ───────────────────────────────────────────────────

  /**
   * GET /athletes/profile — shared dashboard profile
   * Returns the full athlete profile with computed fields for
   * home screen, profile data screen, and personal bests screen.
   */
  async getDashboardProfile(userId: string) {
    const athlete = await athleteRepository.findDashboardProfile(userId);
    if (!athlete) throw new NotFoundError("Athlete profile not found.");

    const now = new Date();
    const dob = new Date(athlete.dateOfBirth);
    const ageYears = Math.floor((now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Derive ageTier from age
    let ageTier: string;
    if (ageYears >= 20) ageTier = "Senior";
    else if (ageYears >= 18) ageTier = "U20";
    else if (ageYears >= 16) ageTier = "Junior";
    else ageTier = "Youth";

    // Personal bests
    const allPersonalBests = await athleteRepository.getPersonalBests(athlete.id);
    const allTime = allPersonalBests.filter((pb) => pb.scope === "ALL_TIME").map((pb) => ({
      id: pb.id, event: pb.event, mark: pb.mark,
      date: pb.date?.toISOString() ?? null, venue: pb.venue,
    }));
    const season = allPersonalBests.filter((pb) => pb.scope === "SEASON").map((pb) => ({
      id: pb.id, event: pb.event, mark: pb.mark,
      date: pb.date?.toISOString() ?? null, venue: pb.venue,
    }));

    // Career records (top personal bests for career card)
    const careerRecords = allTime.slice(0, 5).map((pb) => ({
      label: `${pb.event} PB`,
      value: pb.mark,
    }));

    // Summary counts
    const [trainingSessions, weightEntries, appliedCompetitions] = await Promise.all([
      athleteRepository.countTrainingSessions(athlete.id),
      athleteRepository.countWeightEntries(athlete.id),
      athleteRepository.countAppliedCompetitions(athlete.id),
    ]);

    return {
      id: athlete.id,
      user: athlete.user,
      name: `${athlete.user.firstName} ${athlete.user.lastName}`.trim(),
      amharicName: athlete.amharicName ?? null,
      fanNumber: athlete.faydaNin ?? null,
      photoUrl: athlete.photoUrl ?? null,
      faydaVerified: athlete.faydaVerified,
      faydaVerifiedAt: athlete.faydaVerifiedAt?.toISOString() ?? null,
      primaryEvent: athlete.primaryEvent ?? athlete.sport?.name ?? null,
      clubId: athlete.clubId ?? null,
      clubName: athlete.club?.name ?? athlete.clubName ?? null,
      region: athlete.region ?? null,
      ageTier,
      gender: athlete.gender,
      dateOfBirth: athlete.dateOfBirth.toISOString().split("T")[0],
      nationality: athlete.nationality,
      contact: {
        phoneNumber: athlete.user.phoneNumber ?? null,
        email: athlete.user.email ?? null,
      },
      fitnessStats: {
        heightCm: athlete.height ?? null,
        weightKg: athlete.weight ?? null,
        ageYears,
      },
      careerRecords,
      personalBests: { allTime, season },
      summaryCounts: { trainingSessions, weightEntries, appliedCompetitions },
    };
  }

  /**
   * PATCH /athletes/profile — update editable profile fields
   */
  async updateProfile(userId: string, data: Record<string, unknown>) {
    // Filter out undefined values
    const updates = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    if (Object.keys(updates).length === 0) {
      throw new BadRequestError("No fields to update.");
    }

    const updated = await athleteRepository.updateProfile(userId, updates);
    if (!updated) throw new NotFoundError("Athlete profile not found.");

    return {
      id: updated.id,
      updatedFields: Object.keys(updates),
    };
  }

  /**
   * GET /athletes/profile/personal-bests
   */
  async getPersonalBests(userId: string) {
    const athlete = await athleteRepository.findDashboardProfile(userId);
    if (!athlete) throw new NotFoundError("Athlete profile not found.");

    const all = await athleteRepository.getPersonalBests(athlete.id);
    return {
      allTime: all.filter((pb) => pb.scope === "ALL_TIME").map((pb) => ({
        id: pb.id, event: pb.event, mark: pb.mark,
        date: pb.date?.toISOString().split("T")[0] ?? null, venue: pb.venue,
      })),
      season: all.filter((pb) => pb.scope === "SEASON").map((pb) => ({
        id: pb.id, event: pb.event, mark: pb.mark,
        date: pb.date?.toISOString().split("T")[0] ?? null, venue: pb.venue,
      })),
    };
  }

  /**
   * POST /athletes/profile/personal-bests
   */
  async createPersonalBest(userId: string, data: { event: string; mark: string; date?: Date; venue?: string; scope?: "ALL_TIME" | "SEASON" }) {
    const athlete = await athleteRepository.findDashboardProfile(userId);
    if (!athlete) throw new NotFoundError("Athlete profile not found.");

    const pb = await athleteRepository.createPersonalBest(athlete.id, data);
    return {
      id: pb.id, event: pb.event, mark: pb.mark,
      date: pb.date?.toISOString().split("T")[0] ?? null,
      venue: pb.venue, scope: pb.scope,
    };
  }

  /**
   * GET /athletes/profile/training-logs
   */
  async getTrainingLogs(userId: string) {
    const athlete = await athleteRepository.findDashboardProfile(userId);
    if (!athlete) throw new NotFoundError("Athlete profile not found.");

    const logs = await athleteRepository.getTrainingLogs(athlete.id);
    return logs.map((l) => ({
      id: l.id, date: l.date.toISOString().split("T")[0],
      type: l.type, distanceKm: l.distanceKm,
      durationMinutes: l.durationMinutes, notes: l.notes,
    }));
  }

  /**
   * POST /athletes/profile/training-logs
   */
  async createTrainingLog(userId: string, data: { date: Date; type: string; distanceKm: number; durationMinutes: number; notes?: string }) {
    const athlete = await athleteRepository.findDashboardProfile(userId);
    if (!athlete) throw new NotFoundError("Athlete profile not found.");

    const log = await athleteRepository.createTrainingLog(athlete.id, data);
    return {
      id: log.id, date: log.date.toISOString().split("T")[0],
      type: log.type, distanceKm: log.distanceKm,
      durationMinutes: log.durationMinutes, notes: log.notes,
    };
  }

  /**
   * GET /athletes/profile/weight-logs
   */
  async getWeightLogs(userId: string) {
    const athlete = await athleteRepository.findDashboardProfile(userId);
    if (!athlete) throw new NotFoundError("Athlete profile not found.");

    const logs = await athleteRepository.getWeightLogs(athlete.id);
    return logs.map((l, i) => ({
      id: l.id, date: l.date.toISOString().split("T")[0],
      weightKg: l.weightKg,
      changeKg: i < logs.length - 1 ? Math.round((l.weightKg - logs[i + 1].weightKg) * 10) / 10 : 0,
    }));
  }

  /**
   * POST /athletes/profile/weight-logs
   */
  async createWeightLog(userId: string, data: { date: Date; weightKg: number }) {
    const athlete = await athleteRepository.findDashboardProfile(userId);
    if (!athlete) throw new NotFoundError("Athlete profile not found.");

    const log = await athleteRepository.createWeightLog(athlete.id, data);
    // Get previous entry for change calculation
    const logs = await athleteRepository.getWeightLogs(athlete.id);
    const prevIndex = logs.findIndex((l) => l.id === log.id);
    const prev = prevIndex < logs.length - 1 ? logs[prevIndex + 1] : null;

    return {
      id: log.id, date: log.date.toISOString().split("T")[0],
      weightKg: log.weightKg,
      changeKg: prev ? Math.round((log.weightKg - prev.weightKg) * 10) / 10 : 0,
    };
  }

  /**
   * GET /athletes/applications
   */
  async getApplications(userId: string) {
    const athlete = await athleteRepository.findDashboardProfile(userId);
    if (!athlete) throw new NotFoundError("Athlete profile not found.");

    const registrations = await athleteRepository.getApplications(athlete.id);
    return registrations.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      title: r.event.title,
      disciplines: r.event.disciplines ?? [],
      appliedAt: r.createdAt.toISOString(),
      statusLabel: r.status,
      sourceLabel: "application",
      organizer: r.event.organizerName,
      location: r.event.venue,
      city: null,
      imageUrl: r.event.bannerUrl,
      athleteCount: 1,
      qrCodeValue: r.id,
      qrCodeStatus: "ready",
      registeredMemberName: `${athlete.user.firstName} ${athlete.user.lastName}`,
      registeredMemberType: "Athlete",
      registrationType: "Application",
      clubName: athlete.club?.name ?? athlete.clubName ?? null,
      submissionStatus: r.status,
    }));
  }

  // ─── Public Fan-Facing Methods ──────────────────────────────────────────────

  /**
   * GET /athletes/public — public athlete list for fan browsing.
   * Returns sanitized active athlete data only.
   */
  async getPublicAthletes(query: {
    featured?: boolean;
    status?: string;
    search?: string;
    club?: string;
    region?: string;
    page?: number;
    limit?: number;
  }) {
    return athleteRepository.findPublicAthletes(query);
  }

  /**
   * GET /athletes/public/:id — public athlete detail for fan profile view.
   * Returns a single active athlete's full public profile.
   */
  async getPublicAthleteById(id: string) {
    const a = await athleteRepository.findPublicAthleteById(id);
    if (!a) throw new NotFoundError("Athlete not found.");

    const dob = new Date(a.dateOfBirth);
    const ageYears = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    let ageTier: string;
    if (ageYears >= 20) ageTier = "Senior";
    else if (ageYears >= 18) ageTier = "U20";
    else if (ageYears >= 16) ageTier = "Junior";
    else ageTier = "Youth";

    const personalBests = a.personalBests.map((pb) => ({
      event: pb.event,
      mark: pb.mark,
      date: pb.date?.toISOString().split("T")[0] ?? null,
      venue: pb.venue,
    }));

    const pbSummary = personalBests.length > 0
      ? personalBests.map((pb) => `${pb.event}: ${pb.mark}`).join(" | ")
      : "N/A";

    return {
      id: a.id,
      name: `${a.user.firstName} ${a.user.lastName}`.trim(),
      amharicName: a.amharicName ?? null,
      photoUrl: a.photoUrl ?? null,
      faydaFin: a.faydaNin ?? null,
      faydaVerified: a.faydaVerified,
      faydaVerifiedAt: a.faydaVerifiedAt?.toISOString() ?? null,
      primaryEvent: a.primaryEvent ?? a.sport?.name ?? null,
      clubId: a.clubId ?? null,
      clubName: a.club?.name ?? a.clubName ?? null,
      region: a.region ?? null,
      ageTier,
      gender: a.gender,
      dateOfBirth: a.dateOfBirth.toISOString().split("T")[0],
      nationality: a.nationality,
      pb: pbSummary,
      personalBests,
      achievement: null,
      achievements: [],
      quote: null,
      status: a.status,
    };
  }
}

export const athleteService = new AthleteService();

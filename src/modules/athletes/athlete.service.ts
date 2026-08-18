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
}

export const athleteService = new AthleteService();

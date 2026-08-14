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



export class AthleteService {
  /**
   * Register a new athlete
   */
  async register(
    data: CreateAthleteDTO,
    request: Request,
    options?: { registeredById?: string }
  ) {
    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.dateOfBirth || !data.gender || !data.nationality) {
      throw new BadRequestError("Missing required athlete registration fields.");
    }

    /**
     * Check duplicate email
     */
    const existingUser =
      await athleteRepository.emailExists(
        data.email
      );

    if (existingUser) {
      throw new ConflictError(
        "Email already exists."
      );
    }

    /**
     * Validate sport
     */
    if (data.sportId) {
      const sport =
        await athleteRepository.sportExists(
          data.sportId
        );

      if (!sport) {
        throw new NotFoundError(
          "Sport not found."
        );
      }
    }

    /**
     * Validate club
     */
    if (data.clubId) {
      const club =
        await athleteRepository.clubExists(
          data.clubId
        );

      if (!club) {
        throw new NotFoundError(
          "Club not found."
        );
      }
    }

    /**
     * Hash password
     */
    const hashedPassword =
      await bcrypt.hash(
        data.password,
        12
      );

    /**
     * Save athlete
     */
    const registeredById = options?.registeredById;
    const registrationSource: RegistrationSource = registeredById
      ? RegistrationSource.CLUB_ADMIN
      : RegistrationSource.SELF;

    const athletePayload: AthleteRegistrationInput = {
      ...data,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      nationality: data.nationality,
      registrationSource,
      registeredById,
    };

    const athlete =
      await athleteRepository.register(athletePayload);

    /**
     * Create audit log
     */
    await auditService.log({
      userId: athlete.user.id,

      action: AuditActions.REGISTER,

      entity: "Athlete",

      entityId: athlete.id,

      ipAddress: request.ip,

      userAgent:
        request.get("user-agent") ?? "",

      details: {
        email: athlete.user.email,
        sportId: athlete.sportId,
        clubId: athlete.clubId,
      },
    });

    // Fayda verification is initiated separately via POST /athletes/:athleteId/fayda/initiate

    /**
     * Never return password
     */
    const {
      password,
      ...user
    } = athlete.user;

    return {
      message:
        "Athlete registered successfully.",

      athlete: {
        ...athlete,
        user,
      },
    };
  }

  /**
   * Get athlete by athlete ID
   */
  async getById(id: string) {
    const athlete =
      await athleteRepository.findById(id);

    if (!athlete) {
      throw new NotFoundError(
        "Athlete not found."
      );
    }

    const {
      password,
      ...user
    } = athlete.user;

    return {
      ...athlete,
      user,
    };
  }

  /**
   * Get athlete by authenticated user
   */
  async getByUserId(userId: string) {
    const athlete =
      await athleteRepository.findByUserId(
        userId
      );

    if (!athlete) {
      throw new NotFoundError(
        "Athlete profile not found."
      );
    }

    const {
      password,
      ...user
    } = athlete.user;

    return {
      ...athlete,
      user,
    };
  }

  /**
   * List all athletes
   */
  async findAll() {
    const athletes =
      await athleteRepository.findAll();

    return athletes.map((athlete) => {
      const {
        password,
        ...user
      } = athlete.user;

      return {
        ...athlete,
        user,
      };
    });
  }

  /**
   * Search athletes
   */
  async search(search: string) {
    const athletes =
      await athleteRepository.search(search);

    return athletes.map((athlete) => {
      const {
        password,
        ...user
      } = athlete.user;

      return {
        ...athlete,
        user,
      };
    });
  }

  /**
   * Get athletes by status
   */
  async findByStatus(status: AthleteStatus) {
    const athletes =
      await athleteRepository.findByStatus(
        status
      );

    return athletes.map((athlete) => {
      const {
        password,
        ...user
      } = athlete.user;

      return {
        ...athlete,
        user,
      };
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
    const athlete =
      await athleteRepository.findById(id);

    if (!athlete) {
      throw new NotFoundError(
        "Athlete not found."
      );
    }

    await athleteRepository.delete(id);

    await auditService.log({
      userId: athlete.user.id,

      action: AuditActions.DELETE_ATHLETE,

      entity: "Athlete",

      entityId: athlete.id,
    });

    return {
      message:
        "Athlete deleted successfully.",
    };
  }
}

export const athleteService =
  new AthleteService();
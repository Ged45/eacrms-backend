import bcrypt from "bcrypt";
import { Request } from "express";

import { coachRepository } from "./coach.repository";
import { CreateCoachDTO } from "./dto/create-coach.dto";
import { auditService } from "../audit/audit.service";
import { authorizationService } from "../authorizations/authorization.service";
import { AuditActions } from "../../constants/audit-actions";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";
import { AthleteStatus, RegistrationSource } from "@prisma/client";

export class CoachService {
  async register(
    data: CreateCoachDTO,
    request: Request,
    options?: { registeredById?: string }
  ) {
    const existing = await coachRepository.emailExists(data.email);
    if (existing) throw new ConflictError("Email already exists.");

    if (data.sportId) {
      const sport = await coachRepository.sportExists(data.sportId);
      if (!sport) throw new NotFoundError("Sport not found.");
    }

    if (data.clubId) {
      const club = await coachRepository.clubExists(data.clubId);
      if (!club) throw new NotFoundError("Club not found.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const registeredById = options?.registeredById;
    const registrationSource: RegistrationSource = registeredById
      ? RegistrationSource.CLUB_ADMIN
      : RegistrationSource.SELF;

    const coach = await coachRepository.register({
      ...data,
      password: hashedPassword,
      registrationSource,
      registeredById,
    });

    await auditService.log({
      userId: registeredById ?? coach.user.id,
      action: AuditActions.REGISTER,
      entity: "Coach",
      entityId: coach.id,
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? "",
      details: {
        email: coach.user.email,
        registrationSource,
        clubId: coach.clubId,
      },
    });

    const { password, ...user } = coach.user;
    return {
      message: "Coach registered successfully.",
      coach: { ...coach, user },
    };
  }

  async getById(id: string) {
    const coach = await coachRepository.findById(id);
    if (!coach) throw new NotFoundError("Coach not found.");
    const { password, ...user } = coach.user;
    return { ...coach, user };
  }

  async getByUserId(userId: string) {
    const coach = await coachRepository.findByUserId(userId);
    if (!coach) throw new NotFoundError("Coach profile not found.");
    const { password, ...user } = coach.user;
    return { ...coach, user };
  }

  /**
   * List all coaches
   * @param userId The requesting user's ID for club-scoping
   */
  async findAll(userId?: string) {
    let clubId: string | undefined;
    if (userId) {
      const userRoles = await authorizationService.getUserRoles(userId);
      if (userRoles.includes("CLUB_ADMIN")) {
        clubId = await authorizationService.getClubIdForUser(userId);
      }
    }
    const coaches = clubId ? await coachRepository.findByClub(clubId) : await coachRepository.findAll();
    return coaches.map((c) => {
      const { password, ...user } = c.user;
      return { ...c, user };
    });
  }

  /**
   * Get coaches by status
   * @param userId The requesting user's ID for club-scoping
   */
  async findByStatus(status: AthleteStatus, userId?: string) {
    let clubId: string | undefined;
    if (userId) {
      const userRoles = await authorizationService.getUserRoles(userId);
      if (userRoles.includes("CLUB_ADMIN")) {
        clubId = await authorizationService.getClubIdForUser(userId);
      }
    }
    const coaches = clubId ? await coachRepository.findByClub(clubId) : await coachRepository.findByStatus(status);
    return coaches.map((c) => {
      const { password, ...user } = c.user;
      return { ...c, user };
    });
  }

  async findByClub(clubId: string) {
    const coaches = await coachRepository.findByClub(clubId);
    return coaches.map((c) => {
      const { password, ...user } = c.user;
      return { ...c, user };
    });
  }

  async approve(id: string, adminId: string) {
    const coach = await coachRepository.findById(id);
    if (!coach) throw new NotFoundError("Coach not found.");
    if (coach.status === "APPROVED" || coach.status === "ACTIVE") throw new BadRequestError("Coach is already approved.");
    if (coach.status === "REJECTED") throw new BadRequestError("Cannot approve a rejected coach.");

    const updated = await coachRepository.updateStatus(id, "APPROVED");
    await coachRepository.activateUser(coach.userId);

    await auditService.log({ userId: adminId, action: AuditActions.APPROVE_COACH, entity: "Coach", entityId: id, details: { previousStatus: coach.status } });

    const { password, ...user } = updated.user;
    return { message: "Coach approved. Account is now active.", coach: { ...updated, user } };
  }

  async reject(id: string, adminId: string, reason: string) {
    const coach = await coachRepository.findById(id);
    if (!coach) throw new NotFoundError("Coach not found.");
    if (coach.status === "REJECTED") throw new BadRequestError("Coach is already rejected.");

    const updated = await coachRepository.updateStatus(id, "REJECTED");

    await auditService.log({ userId: adminId, action: AuditActions.REJECT_COACH, entity: "Coach", entityId: id, details: { reason, previousStatus: coach.status } });

    const { password, ...user } = updated.user;
    return { message: "Coach rejected.", coach: { ...updated, user } };
  }

  async activate(id: string, adminId: string) {
    const coach = await coachRepository.findById(id);
    if (!coach) throw new NotFoundError("Coach not found.");
    if (coach.status !== "APPROVED") throw new BadRequestError("Coach must be APPROVED before being set to ACTIVE.");

    const updated = await coachRepository.updateStatus(id, "ACTIVE");

    await auditService.log({ userId: adminId, action: AuditActions.ACTIVATE_COACH, entity: "Coach", entityId: id });

    const { password, ...user } = updated.user;
    return { message: "Coach is now ACTIVE.", coach: { ...updated, user } };
  }

  async suspend(id: string, adminId: string, reason?: string) {
    const coach = await coachRepository.findById(id);
    if (!coach) throw new NotFoundError("Coach not found.");
    if (coach.status === "SUSPENDED") throw new BadRequestError("Coach is already suspended.");

    const updated = await coachRepository.updateStatus(id, "SUSPENDED");
    await coachRepository.deactivateUser(coach.userId);

    await auditService.log({ userId: adminId, action: AuditActions.SUSPEND_COACH, entity: "Coach", entityId: id, details: { reason, previousStatus: coach.status } });

    const { password, ...user } = updated.user;
    return { message: "Coach suspended.", coach: { ...updated, user } };
  }

  async delete(id: string) {
    const coach = await coachRepository.findById(id);
    if (!coach) throw new NotFoundError("Coach not found.");
    await coachRepository.delete(id);
    await auditService.log({
      userId: coach.user.id,
      action: "DELETE_COACH",
      entity: "Coach",
      entityId: coach.id,
    });
    return { message: "Coach deleted successfully." };
  }
}

export const coachService = new CoachService();

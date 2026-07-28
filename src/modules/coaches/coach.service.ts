import bcrypt from "bcrypt";
import { Request } from "express";

import { coachRepository } from "./coach.repository";
import { CreateCoachDTO } from "./dto/create-coach.dto";
import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";
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

  async findAll() {
    const coaches = await coachRepository.findAll();
    return coaches.map((c) => {
      const { password, ...user } = c.user;
      return { ...c, user };
    });
  }

  async findByStatus(status: AthleteStatus) {
    const coaches = await coachRepository.findByStatus(status);
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

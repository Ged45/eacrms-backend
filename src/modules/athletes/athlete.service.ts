import { Request } from "express";
import bcrypt from "bcrypt";

import { athleteRepository } from "./athlete.repository";
import { CreateAthleteDTO } from "./dto/create-athlete.dto";

import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";

import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";

/**
 * Temporary placeholder.
 * Replace this with the real Fayda service later.
 */
const faydaService = {
  async startVerification(data: { athleteId: string }) {
    console.log(
      `Starting Fayda verification for athlete ${data.athleteId}`
    );
  },
};

export class AthleteService {
  /**
   * Register a new athlete
   */
  async register(
    data: CreateAthleteDTO,
    request: Request
  ) {
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
    const athlete =
      await athleteRepository.register({
        ...data,
        password: hashedPassword,
      });

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

    /**
     * Start Fayda verification
     */
    await faydaService.startVerification({
      athleteId: athlete.id,
    });

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
  async findByStatus(status: any) {
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
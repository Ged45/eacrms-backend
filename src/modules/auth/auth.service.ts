import bcrypt from "bcrypt";

import { UserStatus } from "@prisma/client";

import { authRepository } from "./auth.repository";
import { auditService } from "../audit/audit.service";
import { verificationService } from "../verification/verification.service";

import { RegisterDTO, LoginDTO } from "./auth.types";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt";

import { AuditActions } from "../../constants/audit-actions";
import { normalizePhoneNumber } from "../../utils/phone";

const SALT_ROUNDS = 12;

interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export const authService = {
  /**
   * ----------------------------------------
   * Register User
   * ----------------------------------------
   */
  async register(
    data: RegisterDTO,
    metadata?: RequestMetadata
  ) {
    const phoneNumber = data.phoneNumber
      ? normalizePhoneNumber(data.phoneNumber)
      : undefined;
    const existingUser = data.email
      ? await authRepository.findUserByEmail(data.email)
      : phoneNumber
        ? await authRepository.findUserByPhone(phoneNumber)
        : null;

    if (existingUser) {
      throw new Error("Email or phone number already exists.");
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      SALT_ROUNDS
    );

    const user = await authRepository.createUserWithRole({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber,
      roleName: "ATHLETE",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    const verification = user.email
      ? await verificationService.initiateEmailVerification(user.id, user.email)
      : await verificationService.initiatePhoneVerification(user.id, user.phoneNumber!);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: user.status,
      createdAt: user.createdAt,
      verification,
    };
  },

  /**
   * ----------------------------------------
   * Login User
   * ----------------------------------------
   */
  async login(
    data: LoginDTO,
    metadata?: RequestMetadata
  ) {
    const identifier = data.identifier.includes("@")
      ? data.identifier.trim().toLowerCase()
      : normalizePhoneNumber(data.identifier);
    const user = identifier.includes("@")
      ? await authRepository.findUserByEmail(identifier.toLowerCase())
      : await authRepository.findUserByPhone(identifier);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!passwordMatches) {
      throw new Error("Invalid email or password.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error(
        "Your account is not active. Please verify your registered contact method."
      );
    }

    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    await auditService.log({
      userId: user.id,
      action: AuditActions.LOGIN,
      entity: "USER",
      entityId: user.id,
      details: {
        email: user.email,
      },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        roles: user.roles.map((r) => r.role.name),
      },

      accessToken,

      refreshToken,
    };
  },

  /**
   * ----------------------------------------
   * Current User
   * ----------------------------------------
   */
  async me(userId: string) {
    const user = await authRepository.findUserById(
      userId
    );

    if (!user) {
      throw new Error("User not found.");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: user.status,
      roles: user.roles.map((r) => r.role.name),
      permissions: user.roles.flatMap((r) =>
        r.role.permissions.map((p) => p.permission.name)
      ),
    };
  },
};
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
    const existingUser = await authRepository.findUserByEmail(
      data.email
    );

    if (existingUser) {
      throw new Error("Email already exists.");
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
      phoneNumber: data.phoneNumber,
      roleName: "ATHLETE",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    const verification = await verificationService.initiateEmailVerification(
      user.id,
      user.email
    );

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
    const user = await authRepository.findUserByEmail(
      data.email
    );

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
        "Your account is not active. Please verify your email" +
        (user.phoneNumber ? " and phone number" : "") +
        " to activate your account."
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
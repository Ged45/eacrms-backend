import bcrypt from "bcrypt";

import { UserStatus } from "@prisma/client";

import { authRepository } from "./auth.repository";
import { auditService } from "../audit/audit.service";
import { verificationService } from "../verification/verification.service";

import { RegisterDTO, LoginDTO } from "./auth.types";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import {
  storeRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from "../../lib/redis";
import { buildLoginResponse } from "../../utils/auth-contract";

import { AuditActions } from "../../constants/audit-actions";
import { normalizePhoneNumber } from "../../utils/phone";
import { NotFoundError } from "../../errors/NotFoundError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { ConflictError } from "../../errors/ConflictError";
import { BadRequestError } from "../../errors/BadRequestError";

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
      throw new ConflictError("Email or phone number already exists.", {
        code: "USER_CONFLICT",
        entity: "User",
        field: data.email ? "email" : "phoneNumber",
      });
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

    // Determine verification method based on user's choice or defaults
    const verificationMethod = data.verificationMethod ?? (user.email ? "email" : "phone");
    const verification = verificationMethod === "email" && user.email
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
      throw new UnauthorizedError("Invalid email or password.", {
        code: "INVALID_CREDENTIALS",
        entity: "User",
      });
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!passwordMatches) {
      throw new UnauthorizedError("Invalid email or password.", {
        code: "INVALID_CREDENTIALS",
        entity: "User",
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError(
        "Your account is not active. Please verify your registered contact method.",
        {
          code: "ACCOUNT_INACTIVE",
          entity: "User",
          field: "status",
        }
      );
    }

    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in Redis
    await storeRefreshToken(refreshToken, user.id);

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

    const roles = user.roles.map((r) => r.role.name);

    // Extract athlete / club metadata for the mobile login response
    const athlete = (user as any).athlete;
    const adminOf = (user as any).adminOf;
    const fanNumber = athlete?.faydaNin ?? undefined;
    const clubId = athlete?.clubId ?? adminOf?.id ?? undefined;
    const clubName = athlete?.club?.name ?? adminOf?.name ?? undefined;

    return buildLoginResponse({
      userId: user.id,
      email: user.email ?? "",
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roles,
      accessToken,
      refreshToken,
      fanNumber,
      clubId,
      clubName,
    });
  },

  /**
   * ----------------------------------------
   * Refresh Token
   * ----------------------------------------
   */
  async refresh(refreshToken: string) {
    // 1. Verify the refresh token JWT
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token.", {
        code: "INVALID_REFRESH_TOKEN",
        entity: "Token",
      });
    }

    // 2. Check if token exists in Redis (not revoked)
    const storedUserId = await getRefreshToken(refreshToken);
    if (!storedUserId) {
      throw new UnauthorizedError("Refresh token has been revoked or expired.", {
        code: "REFRESH_TOKEN_REVOKED",
        entity: "Token",
      });
    }

    // 3. Verify the userId matches
    if (storedUserId !== payload.userId) {
      throw new UnauthorizedError("Refresh token mismatch.", {
        code: "REFRESH_TOKEN_MISMATCH",
        entity: "Token",
      });
    }

    // 4. Fetch user to get current roles
    const user = await authRepository.findUserById(payload.userId);
    if (!user) {
      throw new NotFoundError("User not found.", {
        code: "USER_NOT_FOUND",
        entity: "User",
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("User account is not active.", {
        code: "ACCOUNT_INACTIVE",
        entity: "User",
        field: "status",
      });
    }

    // 5. Revoke old refresh token (rotation)
    await revokeRefreshToken(refreshToken);

    // 6. Generate new tokens
    const newPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    // 7. Store new refresh token
    await storeRefreshToken(newRefreshToken, user.id);

    // 8. Audit log
    await auditService.log({
      userId: user.id,
      action: "TOKEN_REFRESH",
      entity: "USER",
      entityId: user.id,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  /**
   * ----------------------------------------
   * Logout
   * ----------------------------------------
   */
  async logout(userId: string, refreshToken?: string) {
    // Revoke the specific refresh token if provided
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    await auditService.log({
      userId,
      action: AuditActions.LOGOUT,
      entity: "USER",
      entityId: userId,
    });

    return { message: "Logged out successfully." };
  },

  /**
   * ----------------------------------------
   * Forgot Password
   * Sends a verification code to the user's email or phone
   * ----------------------------------------
   */
  async forgotPassword(identifier: string) {
    const isEmail = identifier.includes("@");
    const user = isEmail
      ? await authRepository.findUserByEmail(identifier.toLowerCase())
      : await authRepository.findUserByPhone(normalizePhoneNumber(identifier));

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { message: "If an account exists with this identifier, a verification code has been sent." };
    }

    let verification;
    if (user.email && isEmail) {
      verification = await verificationService.initiatePasswordReset(user.id, user.email, "EMAIL");
    } else if (user.phoneNumber) {
      verification = await verificationService.initiatePasswordReset(user.id, user.phoneNumber, "PHONE");
    } else {
      return { message: "If an account exists with this identifier, a verification code has been sent." };
    }

    return { message: verification.message };
  },

  /**
   * ----------------------------------------
   * Reset Password
   * Verifies the code and sets a new password
   * ----------------------------------------
   */
  async resetPassword(identifier: string, code: string, newPassword: string) {
    const isEmail = identifier.includes("@");
    const user = isEmail
      ? await authRepository.findUserByEmail(identifier.toLowerCase())
      : await authRepository.findUserByPhone(normalizePhoneNumber(identifier));

    if (!user) {
      throw new NotFoundError("User not found.", { code: "USER_NOT_FOUND", entity: "User" });
    }

    // Verify the reset code
    const verified = await verificationService.verifyPasswordReset(user.id, code);

    if (!verified) {
      throw new BadRequestError("Invalid or expired verification code.", { code: "INVALID_CODE", entity: "Verification" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await authRepository.updateUser(user.id, { password: hashedPassword });

    // Revoke all refresh tokens for this user (force re-login)
    await revokeAllUserRefreshTokens(user.id);

    await auditService.log({
      userId: user.id,
      action: "PASSWORD_RESET",
      entity: "USER",
      entityId: user.id,
      details: { method: isEmail ? "email" : "phone" },
    });

    return { message: "Password has been reset successfully. Please log in with your new password." };
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
      throw new NotFoundError("User not found.", {
        code: "USER_NOT_FOUND",
        entity: "User",
      });
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
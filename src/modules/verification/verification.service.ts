import { VerificationType } from "@prisma/client";

import { verificationRepository } from "./verification.repository";
import { notificationProvider } from "./verification.provider";
import { auditService } from "../audit/audit.service";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { normalizePhoneNumber } from "../../utils/phone";

const EMAIL_CODE_EXPIRY_HOURS = 24;
const PHONE_OTP_EXPIRY_MINUTES = 10;

function generateCode(length = 6): string {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
}

/**
 * After any verification step, check if the user should be auto-activated.
 * Rules:
 *   - A registered email or phone number must be verified.
 *   - If both are provided, either verification is sufficient.
 */
async function checkAndActivate(userId: string) {
  const user = await verificationRepository.findUserById(userId);
  if (!user || user.status === "ACTIVE") return;

  const emailOk = !!user.email && user.emailVerified;
  const phoneOk = !!user.phoneNumber && user.phoneVerified;

  if (emailOk || phoneOk) {
    await verificationRepository.activateUser(userId);
    await auditService.log({
      userId,
      action: "ACCOUNT_ACTIVATED",
      entity: "User",
      entityId: userId,
      details: { reason: "A registered contact method was verified." },
    });
  }
}

export const verificationService = {
  /**
   * Called right after registration.
   * Sends email verification code.
   * Returns the code in non-production for testing.
   */
  async initiateEmailVerification(userId: string, email: string) {
    await verificationRepository.expirePrevious(userId, "EMAIL");

    const code = generateCode(6);
    const expiresAt = new Date(
      Date.now() + EMAIL_CODE_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await verificationRepository.create({
      userId,
      type: "EMAIL",
      code,
      expiresAt,
    });

    await notificationProvider.sendEmailVerification(email, code);

    return {
      message: `Verification code sent to ${email}. Valid for ${EMAIL_CODE_EXPIRY_HOURS} hours.`,
      ...(process.env.NODE_ENV !== "production" && { code }),
    };
  },

  async initiatePhoneVerification(userId: string, phoneNumber: string) {
    await verificationRepository.expirePrevious(userId, "PHONE");

    const otp = generateCode(6);
    const expiresAt = new Date(
      Date.now() + PHONE_OTP_EXPIRY_MINUTES * 60 * 1000
    );

    await verificationRepository.create({
      userId,
      type: "PHONE",
      code: otp,
      expiresAt,
    });

    await notificationProvider.sendPhoneOtp(phoneNumber, otp);

    return {
      message: `OTP sent to ${phoneNumber}. Valid for ${PHONE_OTP_EXPIRY_MINUTES} minutes.`,
      ...(process.env.NODE_ENV !== "production" && { otp }),
    };
  },

  /**
   * User submits the code they received by email.
   */
  async verifyEmail(email: string, code: string) {
    const user = await verificationRepository.findUserByEmail(email);
    if (!user) throw new NotFoundError("User not found.");

    if (user.emailVerified) {
      throw new ConflictError("Email is already verified.");
    }

    const record = await verificationRepository.findLatestByUserAndType(
      user.id,
      "EMAIL"
    );

    if (!record) {
      throw new NotFoundError(
        "No email verification found. Please request a new code."
      );
    }

    if (record.status === "EXPIRED" || record.expiresAt < new Date()) {
      await verificationRepository.markExpired(record.id);
      throw new BadRequestError(
        "Verification code has expired. Please request a new one."
      );
    }

    if (record.status === "VERIFIED") {
      throw new ConflictError("Email is already verified.");
    }

    if (record.code !== code) {
      throw new BadRequestError("Invalid verification code.");
    }

    await verificationRepository.markVerified(record.id);
    await verificationRepository.updateUserEmailVerified(user.id);

    await auditService.log({
      userId: user.id,
      action: "EMAIL_VERIFIED",
      entity: "User",
      entityId: user.id,
      details: { email: user.email },
    });

    await checkAndActivate(user.id);

    const updatedUser = await verificationRepository.findUserById(user.id);

    return {
      message: "Email verified successfully.",
      accountActive: updatedUser?.status === "ACTIVE",
      ...(updatedUser?.status === "ACTIVE" && {
        note: "Your account is now active. You can log in.",
      }),
    };
  },

  /**
   * User requests a phone OTP.
   * Only allowed if the user has a phone number on their account.
   */
  async requestPhoneOtp(userId: string) {
    const user = await verificationRepository.findUserById(userId);
    if (!user) throw new NotFoundError("User not found.");

    if (!user.phoneNumber) {
      throw new BadRequestError(
        "No phone number on this account. Add a phone number first."
      );
    }

    if (user.phoneVerified) {
      throw new ConflictError("Phone number is already verified.");
    }

    return verificationService.initiatePhoneVerification(userId, user.phoneNumber);
  },

  async verifyPhoneByNumber(phoneNumber: string, otp: string) {
    const user = await verificationRepository.findUserByPhone(
      normalizePhoneNumber(phoneNumber)
    );
    if (!user) throw new NotFoundError("User not found.");
    return verificationService.verifyPhone(user.id, otp);
  },

  /**
   * User submits the OTP received on their phone.
   */
  async verifyPhone(userId: string, otp: string) {
    const user = await verificationRepository.findUserById(userId);
    if (!user) throw new NotFoundError("User not found.");

    if (user.phoneVerified) {
      throw new ConflictError("Phone number is already verified.");
    }

    const record = await verificationRepository.findLatestByUserAndType(
      userId,
      "PHONE"
    );

    if (!record) {
      throw new NotFoundError(
        "No phone verification found. Please request an OTP first."
      );
    }

    if (record.status === "EXPIRED" || record.expiresAt < new Date()) {
      await verificationRepository.markExpired(record.id);
      throw new BadRequestError("OTP has expired. Please request a new one.");
    }

    if (record.status === "VERIFIED") {
      throw new ConflictError("Phone number is already verified.");
    }

    if (record.code !== otp) {
      throw new BadRequestError("Invalid OTP.");
    }

    await verificationRepository.markVerified(record.id);
    await verificationRepository.updateUserPhoneVerified(userId);

    await auditService.log({
      userId,
      action: "PHONE_VERIFIED",
      entity: "User",
      entityId: userId,
      details: { phoneNumber: user.phoneNumber },
    });

    await checkAndActivate(userId);

    const updatedUser = await verificationRepository.findUserById(userId);

    return {
      message: "Phone number verified successfully.",
      accountActive: updatedUser?.status === "ACTIVE",
      ...(updatedUser?.status === "ACTIVE" && {
        note: "Your account is now active. You can log in.",
      }),
    };
  },

  /**
   * Resend verification code (email or phone).
   */
  async resend(userId: string, type: VerificationType) {
    const user = await verificationRepository.findUserById(userId);
    if (!user) throw new NotFoundError("User not found.");

    if (type === "EMAIL") {
      if (user.emailVerified) throw new ConflictError("Email is already verified.");
      if (!user.email) throw new BadRequestError("No email on this account.");
      return verificationService.initiateEmailVerification(userId, user.email);
    }

    if (type === "PHONE") {
      if (user.phoneVerified) throw new ConflictError("Phone is already verified.");
      return verificationService.requestPhoneOtp(userId);
    }
  },

  /**
   * Get verification status for a user.
   */
  async getStatus(userId: string) {
    const user = await verificationRepository.findUserById(userId);
    if (!user) throw new NotFoundError("User not found.");

    return {
      email:           user.email,
      emailVerified:   user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      hasPhone:        !!user.phoneNumber,
      phoneVerified:   user.phoneVerified,
      phoneVerifiedAt: user.phoneVerifiedAt,
      accountStatus:   user.status,
      canLogin:        user.status === "ACTIVE",
    };
  },
};

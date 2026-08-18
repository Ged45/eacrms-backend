import prisma from "../../lib/prisma";
import { VerificationType, VerificationStatus } from "@prisma/client";

export const verificationRepository = {
  create(data: {
    userId: string;
    type: VerificationType;
    code: string;
    expiresAt: Date;
  }) {
    return prisma.userVerification.create({ data });
  },

  findByCode(code: string) {
    return prisma.userVerification.findFirst({
      where: { code },
      include: { user: true },
    });
  },

  findLatestByUserAndType(userId: string, type: VerificationType) {
    return prisma.userVerification.findFirst({
      where: { userId, type },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
  },

  markVerified(id: string) {
    return prisma.userVerification.update({
      where: { id },
      data: { status: "VERIFIED" },
    });
  },

  markExpired(id: string) {
    return prisma.userVerification.update({
      where: { id },
      data: { status: "EXPIRED" },
    });
  },

  // Expire all previous pending verifications of same type for a user
  expirePrevious(userId: string, type: VerificationType) {
    return prisma.userVerification.updateMany({
      where: { userId, type, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
  },

  updateUserEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });
  },

  updateUserPhoneVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true, phoneVerifiedAt: new Date() },
    });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserByPhone(phoneNumber: string) {
    return prisma.user.findUnique({ where: { phoneNumber } });
  },

  activateUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });
  },
};

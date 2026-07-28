import prisma from "../../lib/prisma";
import { FaydaVerificationStatus, Prisma } from "@prisma/client";

export const faydaRepository = {
  createVerification(data: {
    nin: string;
    otp: string;
    otpExpiresAt: Date;
    athleteId?: string;
    coachId?: string;
  }) {
    return prisma.faydaVerification.create({ data });
  },

  findById(id: string) {
    return prisma.faydaVerification.findUnique({ where: { id } });
  },

  findLatestByAthlete(athleteId: string) {
    return prisma.faydaVerification.findFirst({
      where: { athleteId },
      orderBy: { createdAt: "desc" },
    });
  },

  findLatestByCoach(coachId: string) {
    return prisma.faydaVerification.findFirst({
      where: { coachId },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus(
    id: string,
    status: FaydaVerificationStatus,
    extra?: { verifiedData?: Prisma.InputJsonValue; attempts?: number }
  ) {
    return prisma.faydaVerification.update({
      where: { id },
      data: { status, ...extra },
    });
  },

  incrementAttempts(id: string, attempts: number) {
    return prisma.faydaVerification.update({
      where: { id },
      data: { attempts },
    });
  },
};

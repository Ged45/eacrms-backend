import prisma from "../../lib/prisma";

import {
  ClubVerificationStatus,
  Prisma,
} from "@prisma/client";

export const clubRepository = {
  /**
   * ----------------------------------------
   * Create Club
   * ----------------------------------------
   */
  create(data: Prisma.ClubCreateInput) {
    return prisma.club.create({
      data,
    });
  },

  /**
   * ----------------------------------------
   * Find Club By ID
   * ----------------------------------------
   */
  findById(id: string) {
    return prisma.club.findUnique({
      where: {
        id,
      },
      include: {
        athletes: true,

        verifier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * ----------------------------------------
   * Find Club By Email
   * ----------------------------------------
   */
  findByEmail(email: string) {
    return prisma.club.findUnique({
      where: {
        email,
      },
    });
  },

  /**
   * ----------------------------------------
   * Find Club By License Number
   * ----------------------------------------
   */
  findByLicense(licenseNumber: string) {
    return prisma.club.findUnique({
      where: {
        licenseNumber,
      },
    });
  },

  /**
   * ----------------------------------------
   * Find Club By Name
   * ----------------------------------------
   */
  findByName(name: string) {
    return prisma.club.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
  },

  /**
   * ----------------------------------------
   * Get All Clubs
   * ----------------------------------------
   */
  findAll() {
    return prisma.club.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * ----------------------------------------
   * Get Pending Clubs
   * ----------------------------------------
   */
  findPending() {
    return prisma.club.findMany({
      where: {
        verificationStatus:
          ClubVerificationStatus.PENDING,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  },

  /**
   * ----------------------------------------
   * Get Verified Clubs (Public)
   * ----------------------------------------
   */
  findVerified(query?: { search?: string; region?: string; city?: string; limit?: number }) {
    const where: any = { verificationStatus: ClubVerificationStatus.VERIFIED };

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { shortName: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query?.region) {
      where.region = { contains: query.region, mode: "insensitive" };
    }
    if (query?.city) {
      where.city = { contains: query.city, mode: "insensitive" };
    }

    return prisma.club.findMany({
      where,
      include: { _count: { select: { athletes: true, coaches: true } } },
      orderBy: { name: "asc" },
      take: query?.limit,
    });
  },

  /**
   * ----------------------------------------
   * Generic Update
   * ----------------------------------------
   */
  update(
    id: string,
    data: Prisma.ClubUpdateInput
  ) {
    return prisma.club.update({
      where: {
        id,
      },

      data,
    });
  },

  /**
   * ----------------------------------------
   * Approve Club
   * ----------------------------------------
   */
  approve(
    id: string,
    verifierId: string
  ) {
    return prisma.club.update({
      where: {
        id,
      },

      data: {
        verificationStatus:
          ClubVerificationStatus.VERIFIED,

        verifiedAt: new Date(),

        verifiedBy: verifierId,

        rejectionReason: null,
      },
    });
  },

  /**
   * ----------------------------------------
   * Reject Club
   * ----------------------------------------
   */
  reject(
    id: string,
    reason: string
  ) {
    return prisma.club.update({
      where: {
        id,
      },

      data: {
        verificationStatus:
          ClubVerificationStatus.REJECTED,

        rejectionReason: reason,
      },
    });
  },

  /**
   * ----------------------------------------
   * Suspend Club
   * ----------------------------------------
   */
  suspend(id: string) {
    return prisma.club.update({
      where: {
        id,
      },

      data: {
        verificationStatus:
          ClubVerificationStatus.SUSPENDED,
      },
    });
  },

  /**
   * ----------------------------------------
   * Delete Club
   * ----------------------------------------
   */
  delete(id: string) {
    return prisma.club.delete({
      where: {
        id,
      },
    });
  },
};
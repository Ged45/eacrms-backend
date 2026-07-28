import { Prisma, PrismaClient, AthleteStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { CreateAthleteDTO } from "./dto/create-athlete.dto";

export class AthleteRepository {
  /**
   * Register a new athlete.
   * Creates:
   * 1. User
   * 2. UserRole (ATHLETE)
   * 3. Athlete Profile
   *
   * All operations execute inside a single transaction.
   */
  async register(data: CreateAthleteDTO) {
    return prisma.$transaction(async (tx) => {
      // Find ATHLETE role
      const athleteRole = await tx.role.findUnique({
        where: {
          name: "ATHLETE",
        },
      });

      if (!athleteRole) {
        throw new Error("ATHLETE role not found.");
      }

      // Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        },
      });

      // Assign Athlete Role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: athleteRole.id,
        },
      });

      // Create Athlete Profile
      const athlete = await tx.athlete.create({
        data: {
          userId:            user.id,
          dateOfBirth:       data.dateOfBirth,
          gender:            data.gender,
          nationality:       data.nationality,
          sportId:           data.sportId,
          clubId:            data.clubId,
          position:          data.position,
          height:            data.height,
          weight:            data.weight,
          dominantHand:      data.dominantHand,
          dominantFoot:      data.dominantFoot,
          bloodType:         data.bloodType,
          registrationSource: data.registrationSource ?? "SELF",
          registeredById:    data.registeredById,
          status:            data.registeredById ? "PENDING" : "DRAFT",
        },
        include: {
          user: true,
          sport: true,
          club: true,
        },
      });

      return athlete;
    });
  }

  /**
   * Find athlete by athlete ID
   */
  async findById(id: string) {
    return prisma.athlete.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        sport: true,
        club: true,
      },
    });
  }

  /**
   * Find athlete by User ID
   */
  async findByUserId(userId: string) {
    return prisma.athlete.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
        sport: true,
        club: true,
      },
    });
  }

  /**
   * Find athlete by Email
   */
  async findByEmail(email: string) {
    return prisma.athlete.findFirst({
      where: {
        user: {
          email,
        },
      },
      include: {
        user: true,
        sport: true,
        club: true,
      },
    });
  }

  /**
   * Update Athlete Profile
   */
  async update(
    id: string,
    data: Prisma.AthleteUpdateInput
  ) {
    return prisma.athlete.update({
      where: {
        id,
      },
      data,
      include: {
        user: true,
        sport: true,
        club: true,
      },
    });
  }

  /**
   * Delete Athlete Profile
   */
  async delete(id: string) {
    return prisma.athlete.delete({
      where: {
        id,
      },
    });
  }

  /**
   * List Athletes
   */
  async findAll() {
    return prisma.athlete.findMany({
      include: {
        user: true,
        sport: true,
        club: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find athletes by status
   */
  async findByStatus(status: AthleteStatus) {
    return prisma.athlete.findMany({
      where: {
        status,
      },
      include: {
        user: true,
        sport: true,
        club: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Search athletes
   */
  async search(search: string) {
    return prisma.athlete.findMany({
      where: {
        OR: [
          {
            user: {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            user: {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            user: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      include: {
        user: true,
        sport: true,
        club: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Check whether a club exists
   */
  async clubExists(clubId: string) {
    return prisma.club.findUnique({
      where: {
        id: clubId,
      },
      select: {
        id: true,
      },
    });
  }

  /**
   * Check whether a sport exists
   */
  async sportExists(sportId: string) {
    return prisma.sport.findUnique({
      where: {
        id: sportId,
      },
      select: {
        id: true,
      },
    });
  }

  /**
   * Check whether email already exists
   */
  async emailExists(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
  }
}

export const athleteRepository = new AthleteRepository();
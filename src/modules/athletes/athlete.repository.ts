import { Prisma, PrismaClient, AthleteStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { AthleteRegistrationInput } from "./dto/create-athlete.dto";

export class AthleteRepository {
  /**
   * Register a new athlete.
   * Creates:
   * 1. User
   * 2. UserRole (ATHLETE)
   * 3. Athlete Profile
   * 4. AthleteSport records (if sportIds provided)
   *
   * All operations execute inside a single transaction.
   */
  async register(data: AthleteRegistrationInput) {
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

      // Determine which sportId to use for the legacy single field.
      // If only sportIds is provided (array), use the first one for the legacy field.
      const primarySportId = data.sportId ?? data.sportIds?.[0] ?? null;

      // Create Athlete Profile
      const athlete = await tx.athlete.create({
        data: {
          userId:              user.id,
          dateOfBirth:         data.dateOfBirth,
          gender:              data.gender,
          nationality:         data.nationality,
          sportId:             primarySportId,
          clubId:              data.clubId,
          clubName:            data.clubName,
          region:              data.region,
          emergencyContactPhone: data.emergencyContactPhone,
          position:            data.position,
          height:              data.height,
          weight:              data.weight,
          dominantHand:        data.dominantHand,
          dominantFoot:        data.dominantFoot,
          bloodType:           data.bloodType,
          registrationSource:  data.registrationSource ?? "SELF",
          registeredById:      data.registeredById,
          status:              data.registeredById ? "PENDING" : "DRAFT",
        },
        include: {
          user: true,
          sport: true,
          club: true,
          athleteSports: { include: { sport: true } },
        },
      });

      // Create AthleteSport join records for sportIds array
      if (data.sportIds && data.sportIds.length > 0) {
        await tx.athleteSport.createMany({
          data: data.sportIds.map((sportId) => ({
            athleteId: athlete.id,
            sportId,
          })),
          skipDuplicates: true,
        });
      } else if (primarySportId) {
        // Backfill: if only sportId was provided, create a join record
        await tx.athleteSport.create({
          data: {
            athleteId: athlete.id,
            sportId: primarySportId,
          },
        });
      }

      // Re-fetch with sport relations included
      return tx.athlete.findUnique({
        where: { id: athlete.id },
        include: {
          user: true,
          sport: true,
          club: true,
          athleteSports: { include: { sport: true } },
        },
      });
    });
  }

  /**
   * Find athlete by athlete ID
   */
  async findById(id: string) {
    return prisma.athlete.findUnique({
      where: { id },
      include: {
        user: true,
        sport: true,
        club: true,
        athleteSports: { include: { sport: true } },
      },
    });
  }

  /**
   * Find athlete by User ID
   */
  async findByUserId(userId: string) {
    return prisma.athlete.findUnique({
      where: { userId },
      include: {
        user: true,
        sport: true,
        club: true,
        athleteSports: { include: { sport: true } },
      },
    });
  }

  /**
   * Find athlete by Email
   */
  async findByEmail(email: string) {
    return prisma.athlete.findFirst({
      where: { user: { email } },
      include: {
        user: true,
        sport: true,
        club: true,
        athleteSports: { include: { sport: true } },
      },
    });
  }

  /**
   * Update Athlete Profile
   */
  async update(id: string, data: Prisma.AthleteUpdateInput) {
    return prisma.athlete.update({
      where: { id },
      data,
      include: {
        user: true,
        sport: true,
        club: true,
        athleteSports: { include: { sport: true } },
      },
    });
  }

  /**
   * Delete Athlete Profile
   */
  async delete(id: string) {
    return prisma.athlete.delete({ where: { id } });
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
        athleteSports: { include: { sport: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find athletes by status
   */
  async findByStatus(status: AthleteStatus) {
    return prisma.athlete.findMany({
      where: { status },
      include: {
        user: true,
        sport: true,
        club: true,
        athleteSports: { include: { sport: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Search athletes
   */
  async search(search: string) {
    return prisma.athlete.findMany({
      where: {
        OR: [
          { user: { firstName: { contains: search, mode: "insensitive" } } },
          { user: { lastName: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      },
      include: {
        user: true,
        sport: true,
        club: true,
        athleteSports: { include: { sport: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Check whether a club exists
   */
  async clubExists(clubId: string) {
    return prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true },
    });
  }

  /**
   * Check whether a sport exists
   */
  async sportExists(sportId: string) {
    return prisma.sport.findUnique({
      where: { id: sportId },
      select: { id: true },
    });
  }

  async updateStatus(id: string, status: AthleteStatus) {
    return prisma.athlete.update({
      where: { id },
      data: { status },
      include: { user: true, sport: true, club: true },
    });
  }

  async activateUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });
  }

  async deactivateUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: "PENDING" },
    });
  }

  /**
   * Check whether email already exists
   */
  async emailExists(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  /**
   * Get all sports (for registration dropdown)
   */
  async findAllSports() {
    return prisma.sport.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get all clubs (for registration dropdown)
   */
  async findAllClubs() {
    return prisma.club.findMany({
      select: { id: true, name: true, region: true, city: true },
      where: { verificationStatus: "VERIFIED" },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get distinct regions from clubs
   */
  async findDistinctRegions() {
    const clubs = await prisma.club.findMany({
      select: { region: true },
      where: {
        region: { not: null },
        verificationStatus: "VERIFIED",
      },
      distinct: ["region"],
      orderBy: { region: "asc" },
    });
    return clubs.map((c) => c.region).filter(Boolean) as string[];
  }
}

export const athleteRepository = new AthleteRepository();

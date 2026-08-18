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

  // ─── Dashboard Methods ─────────────────────────────────────────────────────

  async findDashboardProfile(userId: string) {
    return prisma.athlete.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, status: true, email: true, phoneNumber: true } },
        club: { select: { id: true, name: true } },
        sport: { select: { id: true, name: true } },
        athleteSports: { include: { sport: { select: { id: true, name: true } } } },
      },
    });
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    const athlete = await prisma.athlete.findUnique({ where: { userId } });
    if (!athlete) return null;

    const userFields: Record<string, unknown> = {};
    const athleteFields: Record<string, unknown> = {};

    if (data.phoneNumber !== undefined) userFields.phoneNumber = data.phoneNumber;
    if (data.email !== undefined) userFields.email = data.email;
    if (data.photoUrl !== undefined) athleteFields.photoUrl = data.photoUrl;
    if (data.amharicName !== undefined) athleteFields.amharicName = data.amharicName;
    if (data.primaryEvent !== undefined) athleteFields.primaryEvent = data.primaryEvent;
    if (data.region !== undefined) athleteFields.region = data.region;
    if (data.clubName !== undefined) athleteFields.clubName = data.clubName;
    if (data.clubId !== undefined) athleteFields.clubId = data.clubId;
    if (data.height !== undefined) athleteFields.height = data.height;
    if (data.weight !== undefined) athleteFields.weight = data.weight;

    return prisma.$transaction(async (tx) => {
      if (Object.keys(userFields).length > 0) {
        await tx.user.update({ where: { id: userId }, data: userFields });
      }
      if (Object.keys(athleteFields).length > 0) {
        await tx.athlete.update({ where: { userId }, data: athleteFields });
      }
      return tx.athlete.findUnique({
        where: { userId },
        include: { user: { select: { id: true, firstName: true, lastName: true, status: true, email: true, phoneNumber: true } } },
      });
    });
  }

  async getPersonalBests(athleteId: string) {
    return prisma.personalBest.findMany({ where: { athleteId }, orderBy: { date: "desc" } });
  }

  async createPersonalBest(athleteId: string, data: { event: string; mark: string; date?: Date; venue?: string; scope?: "ALL_TIME" | "SEASON" }) {
    return prisma.personalBest.create({ data: { athleteId, ...data } });
  }

  async getTrainingLogs(athleteId: string) {
    return prisma.trainingLog.findMany({ where: { athleteId }, orderBy: { date: "desc" } });
  }

  async createTrainingLog(athleteId: string, data: { date: Date; type: string; distanceKm: number; durationMinutes: number; notes?: string }) {
    return prisma.trainingLog.create({ data: { athleteId, ...data } });
  }

  async getWeightLogs(athleteId: string) {
    return prisma.weightLog.findMany({ where: { athleteId }, orderBy: { date: "desc" } });
  }

  async createWeightLog(athleteId: string, data: { date: Date; weightKg: number }) {
    return prisma.weightLog.create({ data: { athleteId, ...data } });
  }

  async getApplications(athleteId: string) {
    return prisma.eventRegistration.findMany({
      where: { athleteId },
      include: {
        event: {
          select: {
            id: true, title: true, venue: true, category: true,
            status: true, disciplines: true, bannerUrl: true,
            organizerName: true, schedule: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async countTrainingSessions(athleteId: string) {
    return prisma.trainingLog.count({ where: { athleteId } });
  }

  async countWeightEntries(athleteId: string) {
    return prisma.weightLog.count({ where: { athleteId } });
  }

  async countAppliedCompetitions(athleteId: string) {
    return prisma.eventRegistration.count({ where: { athleteId } });
  }
}

export const athleteRepository = new AthleteRepository();

import { Prisma, AthleteStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { CreateCoachDTO } from "./dto/create-coach.dto";

export class CoachRepository {
  async register(data: CreateCoachDTO) {
    return prisma.$transaction(async (tx) => {
      const coachRole = await tx.role.findUnique({ where: { name: "COACH" } });
      if (!coachRole) throw new Error("COACH role not found.");

      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        },
      });

      await tx.userRole.create({ data: { userId: user.id, roleId: coachRole.id } });

      const coach = await tx.coach.create({
        data: {
          userId:            user.id,
          sportId:           data.sportId,
          clubId:            data.clubId,
          licenseNumber:     data.licenseNumber,
          specialization:    data.specialization,
          yearsOfExperience: data.yearsOfExperience,
          registrationSource: data.registrationSource ?? "SELF",
          registeredById:    data.registeredById,
          status:            data.registeredById ? "PENDING" : "DRAFT",
        },
        include: { user: true, sport: true, club: true },
      });

      return coach;
    });
  }

  async findById(id: string) {
    return prisma.coach.findUnique({
      where: { id },
      include: { user: true, sport: true, club: true },
    });
  }

  async findByUserId(userId: string) {
    return prisma.coach.findUnique({
      where: { userId },
      include: { user: true, sport: true, club: true },
    });
  }

  async findAll() {
    return prisma.coach.findMany({
      include: { user: true, sport: true, club: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByStatus(status: AthleteStatus) {
    return prisma.coach.findMany({
      where: { status },
      include: { user: true, sport: true, club: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByClub(clubId: string) {
    return prisma.coach.findMany({
      where: { clubId },
      include: { user: true, sport: true, club: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: Prisma.CoachUpdateInput) {
    return prisma.coach.update({
      where: { id },
      data,
      include: { user: true, sport: true, club: true },
    });
  }

  async delete(id: string) {
    return prisma.coach.delete({ where: { id } });
  }

  async emailExists(email: string) {
    return prisma.user.findUnique({ where: { email }, select: { id: true } });
  }

  async sportExists(sportId: string) {
    return prisma.sport.findUnique({ where: { id: sportId }, select: { id: true } });
  }

  async clubExists(clubId: string) {
    return prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
  }
}

export const coachRepository = new CoachRepository();

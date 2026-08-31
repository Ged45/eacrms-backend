import prisma from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export class ResultRepository {
  async findByEventId(eventId: string) {
    return prisma.eventResult.findUnique({
      where: { eventId },
      include: {
        versions: { orderBy: { createdAt: "desc" } },
        incidents: { orderBy: { createdAt: "desc" } },
        event: {
          select: {
            id: true,
            title: true,
            status: true,
            category: true,
            schedule: true,
          },
        },
      },
    });
  }

  async createForEvent(eventId: string, data: Prisma.EventResultCreateInput) {
    return prisma.eventResult.create({
      data,
      include: {
        versions: true,
        incidents: true,
      },
    });
  }

  async ensureResult(eventId: string) {
    const existing = await prisma.eventResult.findUnique({ where: { eventId } });
    if (existing) return existing;

    return prisma.eventResult.create({
      data: {
        event: { connect: { id: eventId } },
        status: "SCHEDULED",
        homeScore: 0,
        awayScore: 0,
      },
    });
  }

  async updateResult(eventId: string, data: Prisma.EventResultUpdateInput) {
    return prisma.eventResult.update({
      where: { eventId },
      data,
      include: {
        versions: { orderBy: { createdAt: "desc" } },
        incidents: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  async updateResultWithVersion(
    eventId: string,
    resultData: Prisma.EventResultUpdateInput,
    versionData: Prisma.EventResultVersionCreateInput,
  ) {
    return prisma.$transaction(async (transaction) => {
      const result = await transaction.eventResult.update({
        where: { eventId },
        data: resultData,
        include: {
          versions: { orderBy: { createdAt: "desc" } },
          incidents: { orderBy: { createdAt: "desc" } },
        },
      });

      await transaction.eventResultVersion.create({ data: versionData });
      return result;
    });
  }

  async createVersion(eventResultId: string, data: Prisma.EventResultVersionCreateInput) {
    return prisma.eventResultVersion.create({ data });
  }

  async createIncident(eventResultId: string, data: Prisma.EventResultIncidentCreateInput) {
    return prisma.eventResultIncident.create({ data });
  }

  async findIncidentsByEvent(eventId: string) {
    return prisma.eventResultIncident.findMany({
      where: { eventResult: { eventId } },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const resultRepository = new ResultRepository();

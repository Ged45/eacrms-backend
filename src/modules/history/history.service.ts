import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../errors/NotFoundError";

const prisma = new PrismaClient();

/** Endpoint 4.1: National Athletics Records List */
async function getNationalRecords() {
  const records = await prisma.nationalRecord.findMany({
    orderBy: { date: "desc" },
  });

  return {
    data: records.map((r) => ({
      id: r.id,
      event: r.event,
      record: r.record,
      athlete: r.athlete,
      date: r.date.toISOString().split("T")[0],
      location: r.location,
      club: r.club,
      previousRecord: r.previousRecord,
      notes: r.notes,
    })),
  };
}

/** Endpoint 4.2: Past Season Archives List */
async function getPastSeasons(query: { page?: number; limit?: number }) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [seasons, total] = await Promise.all([
    prisma.pastSeason.findMany({
      orderBy: { year: "desc" },
      skip,
      take: limit,
    }),
    prisma.pastSeason.count(),
  ]);

  return {
    data: seasons.map((s) => ({
      id: s.id,
      year: s.year,
      title: s.title,
      winnerClub: s.winnerClub,
      runnerUpClub: s.runnerUpClub,
      location: s.location,
      date: s.date?.toISOString().split("T")[0],
      totalEvents: s.totalEvents,
      topAthlete: s.topAthlete,
      summary: s.summary,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const historyService = {
  getNationalRecords,
  getPastSeasons,
};

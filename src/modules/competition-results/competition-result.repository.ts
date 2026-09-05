import prisma from "../../lib/prisma";

export const competitionResultRepository = {
  async create(data: {
    eventId: string;
    categoryId: string;
    discipline: string;
    createdById: string;
    entries: Array<{
      athleteId: string;
      bibNo?: string;
      position: number;
      mark: string;
      flag?: string;
      medal?: string | null;
      personalBest: boolean;
      seasonBest: boolean;
      remarks?: string;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const result = await tx.competitionResult.create({
        data: {
          eventId: data.eventId,
          categoryId: data.categoryId,
          discipline: data.discipline,
          createdById: data.createdById,
        },
      });

      if (data.entries.length > 0) {
        await tx.competitionResultEntry.createMany({
          data: data.entries.map((entry) => ({
            competitionResultId: result.id,
            ...entry,
          })),
        });
      }

      return tx.competitionResult.findUnique({
        where: { id: result.id },
        include: {
          entries: {
            include: { athlete: { select: { id: true, user: { select: { firstName: true, lastName: true } } } } },
            orderBy: { position: "asc" },
          },
        },
      });
    });
  },

  async publishByEventId(eventId: string) {
    return prisma.$transaction(async (tx) => {
      const results = await tx.competitionResult.findMany({
        where: { eventId, isPublished: false },
      });

      if (results.length === 0) return { published: 0 };

      await tx.competitionResult.updateMany({
        where: { eventId, isPublished: false },
        data: { isPublished: true, publishedAt: new Date() },
      });

      return { published: results.length };
    });
  },
};

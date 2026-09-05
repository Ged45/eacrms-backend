import prisma from "../../lib/prisma";

export const analyticsRepository = {
  async getDashboard() {
    const [totalClubs, totalAthletes, activeEvents, pendingApplications] = await Promise.all([
      prisma.club.count(),
      prisma.athlete.count(),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.application.count({ where: { status: "PENDING" } }),
    ]);

    return { totalClubs, totalAthletes, activeEvents, pendingApplications };
  },
};

import { EventStatus, Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";

const eventDetails = {
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  statusHistory: {
    orderBy: { createdAt: "asc" as const },
    include: { changedBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
  },
};

/**
 * Augment an event with computed enrollment counts.
 */
async function withEnrollmentCounts<T extends { id: string }>(event: T) {
  const [enrolledClubsCount, totalAthletesEnrolled] = await Promise.all([
    prisma.eventAttendee.count({
      where: { eventId: event.id, attendeeType: "CLUB" },
    }),
    prisma.eventRegistration.count({
      where: { eventId: event.id },
    }),
  ]);
  return { ...event, enrolledClubsCount, totalAthletesEnrolled };
}

async function withEnrollmentCountsMany<T extends { id: string }>(events: T[]) {
  return Promise.all(events.map(withEnrollmentCounts));
}

export const eventRepository = {
  create(data: Prisma.EventCreateInput) {
    return prisma.event.create({ data, include: eventDetails });
  },

  findById(id: string) {
    return prisma.event.findUnique({ where: { id }, include: eventDetails });
  },

  async findDetailById(id: string) {
    const event = await prisma.event.findUnique({ where: { id }, include: eventDetails });
    if (!event) return null;
    return withEnrollmentCounts(event);
  },

  async findAll() {
    const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" }, include: eventDetails });
    return withEnrollmentCountsMany(events);
  },

  async findPublished() {
    const events = await prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      include: eventDetails,
    });
    return withEnrollmentCountsMany(events);
  },

  transition(
    id: string,
    previousStatus: EventStatus,
    newStatus: EventStatus,
    changedById: string,
    reason?: string,
  ) {
    const now = new Date();
    const updateData: Prisma.EventUpdateInput = {
      status: newStatus,
      rejectionReason: newStatus === EventStatus.REJECTED ? reason : null,
      ...(newStatus === EventStatus.PUBLISHED && { approvedBy: { connect: { id: changedById } }, approvedAt: now, publishedAt: now }),
    };

    return prisma.$transaction(async (tx) => {
      const result = await tx.event.updateMany({
        where: { id, status: previousStatus },
        data: updateData,
      });
      if (result.count !== 1) return null;

      await tx.eventStatusHistory.create({
        data: { eventId: id, previousStatus, newStatus, changedById, reason },
      });
      return tx.event.findUniqueOrThrow({ where: { id }, include: eventDetails });
    });
  },
};

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

export const eventRepository = {
  create(data: Prisma.EventCreateInput) {
    return prisma.event.create({ data, include: eventDetails });
  },

  findById(id: string) {
    return prisma.event.findUnique({ where: { id }, include: eventDetails });
  },

  findAll() {
    return prisma.event.findMany({ orderBy: { createdAt: "desc" }, include: eventDetails });
  },

  findPublished() {
    return prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      include: eventDetails,
    });
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

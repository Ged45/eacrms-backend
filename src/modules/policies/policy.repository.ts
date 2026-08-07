import { PolicyScope, PolicyStatus, Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";

const policyDetails = {
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  updatedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  assignments: {
    include: {
      club: { select: { id: true, name: true } },
      event: { select: { id: true, title: true, status: true } },
    },
  },
};

export const policyRepository = {
  create(data: Prisma.PolicyCreateInput) {
    return prisma.policy.create({ data, include: policyDetails });
  },

  findById(id: string) {
    return prisma.policy.findUnique({ where: { id }, include: policyDetails });
  },

  findAll() {
    return prisma.policy.findMany({ orderBy: { updatedAt: "desc" }, include: policyDetails });
  },

  update(id: string, data: Prisma.PolicyUpdateInput) {
    return prisma.policy.update({ where: { id }, data, include: policyDetails });
  },

  async createAssignment(policyId: string, clubId: string | undefined, eventId: string | undefined, createdById: string) {
    return prisma.$transaction(async (tx) => {
      const assignment = await tx.policyAssignment.create({
        data: { policyId, clubId, eventId, createdById },
        include: { club: { select: { id: true, name: true } }, event: { select: { id: true, title: true } } },
      });
      await tx.policyAuditLog.create({
        data: { policyId, action: "ASSIGNED", changedById: createdById, newValue: { assignmentId: assignment.id, clubId, eventId } },
      });
      return assignment;
    });
  },

  async deleteAssignment(policyId: string, assignmentId: string, changedById: string) {
    return prisma.$transaction(async (tx) => {
      const assignment = await tx.policyAssignment.findFirst({ where: { id: assignmentId, policyId } });
      if (!assignment) return null;
      await tx.policyAssignment.delete({ where: { id: assignmentId } });
      await tx.policyAuditLog.create({
        data: { policyId, action: "UNASSIGNED", changedById, oldValue: { assignmentId, clubId: assignment.clubId, eventId: assignment.eventId } },
      });
      return assignment;
    });
  },

  findAuditLog(policyId: string) {
    return prisma.policyAuditLog.findMany({
      where: { policyId },
      orderBy: { createdAt: "desc" },
      include: { changedBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  },

  findRelevant(userId: string) {
    return prisma.policy.findMany({
      where: {
        status: PolicyStatus.ACTIVE,
        assignments: {
          some: {
            OR: [
              { club: { athletes: { some: { userId } } } },
              { club: { coaches: { some: { userId } } } },
              { event: { createdById: userId } },
            ],
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      include: policyDetails,
    });
  },

  findApplicable(scope: PolicyScope, target: { clubId?: string; eventId?: string }) {
    return prisma.policy.findMany({
      where: {
        scope,
        status: PolicyStatus.ACTIVE,
        assignments: {
          some: {
            OR: [
              ...(target.clubId ? [{ clubId: target.clubId }] : []),
              ...(target.eventId ? [{ eventId: target.eventId }] : []),
            ],
          },
        },
      },
    });
  },
};

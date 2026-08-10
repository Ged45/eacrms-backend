import prisma from "../../lib/prisma";
import { Prisma, PolicyStatus } from "@prisma/client";

export const policiesRepository = {
  /**
   * Create a new policy
   */
  async create(data: Prisma.PolicyCreateInput) {
    return prisma.policy.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Get all policies with filters
   */
  async findMany(where?: Prisma.PolicyWhereInput) {
    return prisma.policy.findMany({
      where: {
        ...where,
        deletedAt: null, // Exclude soft-deleted
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get single policy by ID
   */
  async findById(id: string) {
    return prisma.policy.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Update a policy
   */
  async update(id: string, data: Prisma.PolicyUpdateInput) {
    return prisma.policy.update({
      where: { id },
      data: {
        ...data,
        version: {
          increment: 1,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  /**
   * Approve a policy
   */
  async approve(id: string, approvedById: string) {
    return prisma.policy.update({
      where: { id },
      data: {
        status: PolicyStatus.ACTIVE,
        approvedBy: {
          connect: { id: approvedById },
        },
      },
      include: {
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  /**
   * Soft delete a policy
   */
  async softDelete(id: string) {
    return prisma.policy.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  /**
   * Archive a policy
   */
  async archive(id: string) {
    return prisma.policy.update({
      where: { id },
      data: { status: PolicyStatus.ARCHIVED },
    });
  },
};
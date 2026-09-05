import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { ApplicationQueryDTO } from "./application.validation";

export const applicationRepository = {
  async findAll(query: ApplicationQueryDTO) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          reviewedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return { data: applications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  async update(id: string, data: Prisma.ApplicationUpdateInput) {
    return prisma.application.update({ where: { id }, data });
  },
};

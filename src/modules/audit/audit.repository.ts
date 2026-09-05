import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { AuditLogDTO } from "./audit.types";
import { ActivityLogQueryDTO } from "./audit.validation";

const SYSTEM_USER_EMAIL = "admin@eacrms.local";

export const auditRepository = {
  async create(data: AuditLogDTO) {
    const requestedUserId = data.userId?.trim();
    if (!requestedUserId) return null;

    let userId = requestedUserId;
    if (requestedUserId === "system") {
      const systemUser = await prisma.user.findUnique({ where: { email: SYSTEM_USER_EMAIL } });
      if (!systemUser) return null;
      userId = systemUser.id;
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) return null;

    return prisma.auditLog.create({
      data: {
        userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        newValue: data.details !== undefined ? (data.details as Prisma.InputJsonValue) : Prisma.DbNull,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  },

  async findAll(query: ActivityLogQueryDTO) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.entityType) {
      where.entity = { contains: query.entityType, mode: "insensitive" };
    }
    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: "insensitive" } },
        { entity: { contains: query.search, mode: "insensitive" } },
        { entityId: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data: logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },
};

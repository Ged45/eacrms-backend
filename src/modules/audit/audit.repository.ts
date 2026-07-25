import prisma from "../../config/prisma";

import { AuditLogDTO } from "./audit.types";

export const auditRepository = {

    async create(data: AuditLogDTO) {

        return prisma.auditLog.create({

            data: {

                userId: data.userId,

                action: data.action,

                entity: data.entity,

                entityId: data.entityId,

                details: data.details,

                ipAddress: data.ipAddress,

                userAgent: data.userAgent,

            },

        });

    },

};
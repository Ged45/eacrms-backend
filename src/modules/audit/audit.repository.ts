import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";

import { AuditLogDTO } from "./audit.types";

export const auditRepository = {

    async create(data: AuditLogDTO) {

        return prisma.auditLog.create({

            data: {

                userId: data.userId,

                action: data.action,

                entity: data.entity,

                entityId: data.entityId,

                newValue: data.details !== undefined
                    ? (data.details as Prisma.InputJsonValue)
                    : Prisma.DbNull,

                ipAddress: data.ipAddress,

                userAgent: data.userAgent,

            },

        });

    },

};
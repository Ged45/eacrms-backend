import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";

import { AuditLogDTO } from "./audit.types";

const SYSTEM_USER_EMAIL = "admin@eacrms.local";

export const auditRepository = {

    async create(data: AuditLogDTO) {
        const requestedUserId = data.userId?.trim();

        if (!requestedUserId) {
            return null;
        }

        let userId = requestedUserId;

        if (requestedUserId === "system") {
            const systemUser = await prisma.user.findUnique({
                where: { email: SYSTEM_USER_EMAIL },
            });

            if (!systemUser) {
                return null;
            }

            userId = systemUser.id;
        }

        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return null;
        }

        return prisma.auditLog.create({

            data: {

                userId,

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
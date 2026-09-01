import prisma from "../../lib/prisma";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";
import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";

export const userService = {
  async activate(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found.", { code: "USER_NOT_FOUND", entity: "User" });
    if (user.status === "ACTIVE") throw new BadRequestError("User is already active.", { code: "USER_ALREADY_ACTIVE", entity: "User", field: "status" });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
      select: { id: true, email: true, firstName: true, lastName: true, status: true },
    });

    await auditService.log({
      userId: adminId,
      action: AuditActions.ACTIVATE_USER,
      entity: "User",
      entityId: userId,
    });

    return { message: "User account activated.", user: updated };
  },

  async deactivate(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found.", { code: "USER_NOT_FOUND", entity: "User" });
    if (user.status !== "ACTIVE") throw new BadRequestError("User is not active.", { code: "USER_NOT_ACTIVE", entity: "User", field: "status" });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED" },
      select: { id: true, email: true, firstName: true, lastName: true, status: true },
    });

    await auditService.log({
      userId: adminId,
      action: AuditActions.DEACTIVATE_USER,
      entity: "User",
      entityId: userId,
    });

    return { message: "User account deactivated.", user: updated };
  },

  async delete(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) throw new NotFoundError("User not found.", { code: "USER_NOT_FOUND", entity: "User" });

    // Prevent deleting yourself
    if (userId === adminId) {
      throw new BadRequestError("You cannot delete your own account.", { code: "SELF_DELETE_FORBIDDEN", entity: "User" });
    }

    // Log before deleting (cascade will remove the user's own audit logs)
    await auditService.log({
      userId: adminId,
      action: "DELETE_USER",
      entity: "User",
      entityId: userId,
      details: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    // DB CASCADE handles: AuditLog, UserRole, Athlete, Coach,
    // FaydaVerification, UserVerification automatically
    await prisma.user.delete({ where: { id: userId } });

    return {
      message: `User ${user.email} has been permanently deleted.`,
    };
  },

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        roles: { select: { role: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};

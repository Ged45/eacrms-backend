import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";
import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { BadRequestError } from "../../errors/BadRequestError";
import { AuditActions } from "../../constants/audit-actions";
import { auditService } from "../audit/audit.service";
import { CreateUserDTO, UpdateUserDTO } from "./admin.validation";

const SALT_ROUNDS = 12;

interface Metadata { ipAddress?: string; userAgent?: string; }

export const adminService = {
  async createUser(data: CreateUserDTO, adminId: string, metadata?: Metadata) {
    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError("Email already exists.", { code: "EMAIL_CONFLICT", entity: "User", field: "email" });

    // Check role exists
    const role = await prisma.role.findUnique({ where: { name: data.role } });
    if (!role) throw new NotFoundError("Role not found.", { code: "ROLE_NOT_FOUND", entity: "Role" });

    // Generate random password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";
    const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    // Create user with role
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.name.split(" ")[0] || data.name,
          lastName: data.name.split(" ").slice(1).join(" ") || "",
          phoneNumber: data.phone,
          status: "ACTIVE",
        },
      });

      await tx.userRole.create({
        data: { userId: newUser.id, roleId: role.id },
      });

      return newUser;
    });

    await auditService.log({
      userId: adminId,
      action: AuditActions.CREATE_USER,
      entity: "User",
      entityId: user.id,
      details: { email: data.email, role: data.role, department: data.department },
      ...metadata,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: data.role,
      tempPassword,
    };
  },

  async updateUser(id: string, data: UpdateUserDTO, adminId: string, metadata?: Metadata) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User not found.", { code: "USER_NOT_FOUND", entity: "User" });

    const updateData: Record<string, any> = {};
    if (data.name) {
      updateData.firstName = data.name.split(" ")[0] || data.name;
      updateData.lastName = data.name.split(" ").slice(1).join(" ") || "";
    }
    if (data.phone) updateData.phoneNumber = data.phone;
    if (data.enabled !== undefined) {
      updateData.status = data.enabled ? "ACTIVE" : "SUSPENDED";
    }

    // Handle role change
    if (data.role) {
      const role = await prisma.role.findUnique({ where: { name: data.role } });
      if (!role) throw new NotFoundError("Role not found.", { code: "ROLE_NOT_FOUND", entity: "Role" });

      await prisma.$transaction(async (tx) => {
        // Remove existing roles
        await tx.userRole.deleteMany({ where: { userId: id } });
        // Assign new role
        await tx.userRole.create({ data: { userId: id, roleId: role.id } });
      });
    }

    // Handle permissions change
    if (data.permissions && data.role) {
      const role = await prisma.role.findUnique({ where: { name: data.role } });
      if (role) {
        await prisma.$transaction(async (tx) => {
          await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
          for (const permName of data.permissions!) {
            const perm = await tx.permission.findUnique({ where: { name: permName } });
            if (perm) {
              await tx.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id } });
            }
          }
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, firstName: true, lastName: true, status: true, phoneNumber: true },
    });

    await auditService.log({
      userId: adminId,
      action: AuditActions.UPDATE_USER,
      entity: "User",
      entityId: id,
      details: { ...data, name: undefined },
      ...metadata,
    });

    return updated;
  },
};

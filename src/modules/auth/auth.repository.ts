import prisma from "../../lib/prisma";
import { Prisma, UserStatus } from "@prisma/client";

export const authRepository = {
  /**
   * ----------------------------------------
   * User Queries
   * ----------------------------------------
   */

  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  },

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  },

  /**
   * ----------------------------------------
   * Role Queries
   * ----------------------------------------
   */

  findRoleByName(name: string) {
    return prisma.role.findUnique({
      where: {
        name,
      },
    });
  },

  assignRole(userId: string, roleId: string) {
    return prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  },

  /**
   * ----------------------------------------
   * Audit Log
   * ----------------------------------------
   */

  createAuditLog(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({
      data,
    });
  },

  /**
   * ----------------------------------------
   * Registration Transaction
   * ----------------------------------------
   */

  async createUserWithRole(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    roleName: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({
        where: {
          name: data.roleName,
        },
      });

      if (!role) {
        throw new Error(`Role '${data.roleName}' not found.`);
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          status: UserStatus.PENDING,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "REGISTER",
          entity: "USER",
          entityId: user.id,
          newValue: {
            email: user.email,
            role: role.name,
          },
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      return user;
    });
  },

  /**
   * ----------------------------------------
   * Refresh Token (Future)
   * ----------------------------------------
   */

  saveRefreshToken() {
    // We'll implement this after
    // creating the RefreshToken table.
  },

  revokeRefreshToken() {
    // Coming later.
  },
};
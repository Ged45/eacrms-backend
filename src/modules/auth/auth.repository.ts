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
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
        athlete: {
          include: { club: true },
        },
        adminOf: true,
      },
    });
  },

  findUserByPhone(phoneNumber: string) {
    return prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
        athlete: {
          include: { club: true },
        },
        adminOf: true,
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
    email?: string;
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
   * Club Admin Registration Transaction
   * ----------------------------------------
   */

  async createUserWithClubAdmin(data: {
    email?: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    clubData: {
      name: string;
      shortName?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      region?: string;
      licenseNumber?: string;
      logoUrl?: string;
    };
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Find CLUB_ADMIN role
      const role = await tx.role.findUnique({
        where: { name: "CLUB_ADMIN" },
      });

      if (!role) {
        throw new Error("Role 'CLUB_ADMIN' not found.");
      }

      // Create user
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

      // Assign CLUB_ADMIN role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      // Create club linked to this user as admin
      const club = await tx.club.create({
        data: {
          ...data.clubData,
          adminId: user.id,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "REGISTER",
          entity: "CLUB_ADMIN",
          entityId: user.id,
          newValue: {
            email: user.email,
            role: role.name,
            clubId: club.id,
            clubName: club.name,
          },
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      return { user, club };
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
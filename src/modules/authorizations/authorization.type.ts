import prisma from "../../lib/prisma";

export const authorizationRepository = {

    async getUserPermissions(userId: string) {

        const user =
            await prisma.user.findUnique({

                where: {
                    id: userId,
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

        if (!user) {
            return [];
        }

        const permissions =
            user.roles.flatMap(userRole =>
                userRole.role.permissions.map(
                    rolePermission =>
                        rolePermission.permission.name
                )
            );

        return [...new Set(permissions)];

    },

};


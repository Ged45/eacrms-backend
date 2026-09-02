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

    async getUserRoles(userId: string) {
        const user =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });

        if (!user) {
            return [];
        }

        return user.roles.map(userRole => userRole.role.name);
    },

    /**
     * Find the club ID for a user who is a CLUB_ADMIN.
     * Returns undefined if the user is not a club admin.
     */
    async getClubIdForUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                adminOf: {
                    select: { id: true },
                },
            },
        });

        return user?.adminOf?.id ?? undefined;
    },

};
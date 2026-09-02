import { authorizationRepository } from "./authorization.repository";

export const authorizationService = {

    async hasPermission(
        userId: string,
        permission: string
    ) {

        const permissions =
            await authorizationRepository
            .getUserPermissions(userId);

        return permissions.includes(permission);

    },

    async getUserRoles(userId: string) {
        return authorizationRepository.getUserRoles(userId);
    },

    /**
     * Get the club ID for a CLUB_ADMIN user.
     * Returns undefined if the user is not a club admin.
     */
    async getClubIdForUser(userId: string) {
        return authorizationRepository.getClubIdForUser(userId);
    },

};
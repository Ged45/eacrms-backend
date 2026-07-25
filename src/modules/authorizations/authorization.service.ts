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

};
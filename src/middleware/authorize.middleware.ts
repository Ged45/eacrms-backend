import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/ForbiddenError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { authorizationService } from "../modules/authorizations/authorization.service";

export function authorize(permission: string | string[]) {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.user || !req.user.userId) {
                throw new UnauthorizedError(
                    "User context missing. Ensure authentication middleware runs before authorization."
                );
            }

            const userId = req.user.userId;
            const permissionsToCheck = Array.isArray(permission)
                ? permission
                : [permission];

            const permissionResults = await Promise.all(
                permissionsToCheck.map((p) =>
                    authorizationService.hasPermission(userId, p)
                )
            );

            const isAllowed = permissionResults.some((allowed) => allowed);

            if (!isAllowed) {
                throw new ForbiddenError(
                    "You do not have permission to perform this action."
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
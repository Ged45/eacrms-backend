import {
    Request,
    Response,
    NextFunction,
} from "express";

import { ForbiddenError } from "../errors/ForbiddenError";

import { authorizationService }
from "../modules/authorization/authorization.service";

export function authorize(
    permission: string
) {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const userId =
                req.user.userId;

            const allowed =
                await authorizationService
                    .hasPermission(
                        userId,
                        permission
                    );

            if (!allowed) {
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
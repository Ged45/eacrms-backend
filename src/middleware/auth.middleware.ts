import { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../utils/jwt";

import { UnauthorizedError } from "../errors/UnauthorizedError";

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError(
                "Access token missing."
            );
        }

        const [scheme, token] =
            authHeader.split(" ");

        if (scheme !== "Bearer") {
            throw new UnauthorizedError(
                "Invalid authorization format."
            );
        }

        if (!token) {
            throw new UnauthorizedError(
                "Access token missing."
            );
        }

        const payload =
            verifyAccessToken(token);

        req.user = payload;

        next();

    } catch {

        next(
            new UnauthorizedError(
                "Invalid or expired token."
            )
        );

    }
}
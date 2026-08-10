import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError("Access token missing.");
        }

        // Case-insensitive check for Bearer scheme
        if (!/^Bearer\s+/i.test(authHeader)) {
            throw new UnauthorizedError(
                "Invalid authorization format. Expected 'Bearer <token>'."
            );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new UnauthorizedError("Access token missing.");
        }

        const payload = verifyAccessToken(token);

        req.user = payload;

        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else if (error instanceof Error && error.message.includes("SECRET")) {
            // Forward configuration errors directly to global error handler (500)
            next(error);
        } else {
            next(new UnauthorizedError("Invalid or expired token."));
        }
    }
}
import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/ForbiddenError";
import { authorizationService } from "../modules/authorizations/authorization.service";

/**
 * Middleware to restrict access to specific roles.
 * Usage: requireRole("SUPER_ADMIN", "FEDERATION_ADMIN")
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = await authorizationService.getUserRoles(req.user.userId);
      const hasRole = userRoles.some((role) => allowedRoles.includes(role));
      
      if (!hasRole) {
        throw new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

import { NextFunction, Request, Response } from "express";
import { PolicyScope, PolicyStatus } from "@prisma/client";
import { ForbiddenError } from "../errors/ForbiddenError";
import { authorizationService } from "../modules/authorizations/authorization.service";
import { policiesService } from "../modules/policies/policies.service";

export type PolicyTarget = { clubId?: string; eventId?: string };

/**
 * Enforces active policies assigned to the target resource. Dynamic rules may
 * block an operation or require extra permissions; other rule keys remain
 * available to the consuming module for domain-specific enforcement.
 */
export function enforcePolicies(scope: PolicyScope, resolveTarget: (req: Request) => PolicyTarget) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const _target = resolveTarget(req);
      const policies = await policiesService.getAll({ scope, status: PolicyStatus.ACTIVE });

      for (const policy of policies) {
        const rules = (policy as any).rules as { blocked?: unknown; requiredPermissions?: unknown } | undefined;
        
        if (rules?.blocked === true) {
          throw new ForbiddenError(`Policy ${policy.name} currently blocks this action.`);
        }

        if (Array.isArray(rules?.requiredPermissions)) {
          const userId = (req as any).user?.id || (req as any).user?.userId;

          for (const permission of rules.requiredPermissions) {
            if (
              typeof permission !== "string" ||
              !(await authorizationService.hasPermission(userId, permission))
            ) {
              throw new ForbiddenError(
                `Policy ${policy.name} requires additional permission: ${String(permission)}.`
              );
            }
          }
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
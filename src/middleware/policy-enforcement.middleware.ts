import { NextFunction, Request, Response } from "express";
import { PolicyScope } from "@prisma/client";
import { ForbiddenError } from "../errors/ForbiddenError";
import { authorizationService } from "../modules/authorizations/authorization.service";
import { policyService } from "../modules/policies/policy.service";

export type PolicyTarget = { clubId?: string; eventId?: string };

/**
 * Enforces active policies assigned to the target resource. Dynamic rules may
 * block an operation or require extra permissions; other rule keys remain
 * available to the consuming module for domain-specific enforcement.
 */
export function enforcePolicies(scope: PolicyScope, resolveTarget: (req: Request) => PolicyTarget) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const policies = await policyService.findApplicable(scope, resolveTarget(req));
      for (const policy of policies) {
        const rules = policy.rules as { blocked?: unknown; requiredPermissions?: unknown };
        if (rules.blocked === true) throw new ForbiddenError(`Policy ${policy.code} currently blocks this action.`);
        if (Array.isArray(rules.requiredPermissions)) {
          for (const permission of rules.requiredPermissions) {
            if (typeof permission !== "string" || !await authorizationService.hasPermission(req.user.userId, permission)) {
              throw new ForbiddenError(`Policy ${policy.code} requires additional permission: ${String(permission)}.`);
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

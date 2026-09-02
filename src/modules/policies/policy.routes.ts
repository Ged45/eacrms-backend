import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { validate } from "../../middleware/validate.middleware";
import { policyController } from "./policy.controller";
import { assignPolicySchema, createPolicySchema, updatePolicySchema } from "./policy.validation";

const router = Router();

router.get("/relevant", authenticate, policyController.findRelevant);

// Policy management - SUPER_ADMIN and FEDERATION_ADMIN only
router.get("/", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("policy:view"), policyController.findAll);
router.post("/", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("policy:create"), validate(createPolicySchema), policyController.create);
router.get("/:id", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("policy:view"), policyController.findById);
router.patch("/:id", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("policy:update"), validate(updatePolicySchema), policyController.update);
router.post("/:id/assignments", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("policy:update"), validate(assignPolicySchema), policyController.assign);
router.delete("/:id/assignments/:assignmentId", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("policy:update"), policyController.unassign);
router.get("/:id/audit", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("policy:view"), policyController.auditLog);

export default router;

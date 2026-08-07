import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { policyController } from "./policy.controller";
import { assignPolicySchema, createPolicySchema, updatePolicySchema } from "./policy.validation";

const router = Router();

router.get("/relevant", authenticate, policyController.findRelevant);
router.get("/", authenticate, authorize("policy:view"), policyController.findAll);
router.post("/", authenticate, authorize("policy:create"), validate(createPolicySchema), policyController.create);
router.get("/:id", authenticate, authorize("policy:view"), policyController.findById);
router.patch("/:id", authenticate, authorize("policy:update"), validate(updatePolicySchema), policyController.update);
router.post("/:id/assignments", authenticate, authorize("policy:update"), validate(assignPolicySchema), policyController.assign);
router.delete("/:id/assignments/:assignmentId", authenticate, authorize("policy:update"), policyController.unassign);
router.get("/:id/audit", authenticate, authorize("policy:view"), policyController.auditLog);

export default router;

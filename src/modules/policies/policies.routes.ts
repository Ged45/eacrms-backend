import { Router } from "express";
import { policiesController } from "./policies.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createPolicySchema, updatePolicySchema } from "./policies.validation";

const router = Router();

// Require authentication for all policy endpoints
router.use(authenticate);

// Create a new policy draft
router.post("/", validate(createPolicySchema), policiesController.create);

// Retrieve all policies with optional filters
router.get("/", policiesController.getAll);

// Get policy details by ID
router.get("/:id", policiesController.getById);

// Update an existing policy
router.put("/:id", validate(updatePolicySchema), policiesController.update);

// Submit a DRAFT policy for approval
router.post("/:id/submit", policiesController.submitForApproval);

// Approve a policy submitted for review
router.post("/:id/approve", policiesController.approve);

// Archive an active or draft policy
router.post("/:id/archive", policiesController.archive);

// Soft delete a policy
router.delete("/:id", policiesController.delete);

export default router;
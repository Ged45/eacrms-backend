import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { validate } from "../../middleware/validate.middleware";
import { adminController } from "./admin.controller";
import { createUserSchema, updateUserSchema } from "./admin.validation";

const router = Router();

// POST /admin/users — create a new staff user
router.post(
  "/users",
  authenticate,
  requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"),
  authorize("user:create"),
  validate(createUserSchema),
  adminController.createUser
);

export default router;

// PATCH /users/:id — update user (mounted separately in routes/index.ts)
export const userUpdateRouter = Router();
userUpdateRouter.patch(
  "/:id",
  authenticate,
  requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"),
  authorize("user:update"),
  validate(updateUserSchema),
  adminController.updateUser
);

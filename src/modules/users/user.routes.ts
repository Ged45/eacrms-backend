import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { requireRole } from "../../middleware/requireRole.middleware";

const router = Router();

// Only SUPER_ADMIN and FEDERATION_ADMIN can manage users
router.get(   "/",               authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("user:view"),   userController.findAll);
router.patch( "/:id/activate",   authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("user:update"), userController.activate);
router.patch( "/:id/deactivate", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("user:update"), userController.deactivate);
router.delete("/:id",            authenticate, requireRole("SUPER_ADMIN"), authorize("user:delete"), userController.delete);

export default router;

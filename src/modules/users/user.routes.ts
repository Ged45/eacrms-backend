import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

router.get(   "/",               authenticate, authorize("user:view"),   userController.findAll);
router.patch( "/:id/activate",   authenticate, authorize("user:update"), userController.activate);
router.patch( "/:id/deactivate", authenticate, authorize("user:update"), userController.deactivate);
router.delete("/:id",            authenticate, authorize("user:delete"), userController.delete);

export default router;

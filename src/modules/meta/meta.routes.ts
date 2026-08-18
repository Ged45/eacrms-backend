import { Router } from "express";
import { metaController } from "./meta.controller";

const router = Router();

/**
 * GET /meta/registration-options
 * Public endpoint — returns disciplines, clubs, and regions for the registration form.
 */
router.get("/meta/registration-options", metaController.getRegistrationOptions);

export default router;

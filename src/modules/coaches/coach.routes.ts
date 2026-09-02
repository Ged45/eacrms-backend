import { Router } from "express";
import { coachController } from "./coach.controller";
import { validate } from "../../middleware/validate.middleware";
import { createCoachSchema } from "./coach.validation";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { requireRole } from "../../middleware/requireRole.middleware";

const router = Router();

// Public — self-registration
router.post("/register", validate(createCoachSchema), coachController.register);

// Club admin registers a coach
router.post(
  "/register/by-admin",
  authenticate,
  requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN"),
  authorize("coach:create"),
  validate(createCoachSchema),
  coachController.registerByClubAdmin
);

// Coach sees own profile
router.get("/profile", authenticate, coachController.getProfile);

// Admin routes
router.get("/",               authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN"), authorize("coach:view"),   coachController.findAll);
router.get("/status/:status", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN"), authorize("coach:view"),   coachController.findByStatus);
router.get("/club/:clubId",   authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN"), authorize("coach:view"),   coachController.findByClub);
router.patch("/:id/approve",  authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN"), authorize("coach:update"), coachController.approve);
router.patch("/:id/reject",   authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN"), authorize("coach:update"), coachController.reject);
router.patch("/:id/activate", authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN"), authorize("coach:update"), coachController.activate);
router.patch("/:id/suspend",  authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN"), authorize("coach:update"), coachController.suspend);
router.get("/:id",            authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN", "CLUB_ADMIN", "COACH"), authorize("coach:view"),   coachController.getById);
router.delete("/:id",         authenticate, requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"), authorize("coach:delete"), coachController.delete);

export default router;

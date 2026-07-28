import { Router } from "express";
import { coachController } from "./coach.controller";
import { validate } from "../../middleware/validate.middleware";
import { createCoachSchema } from "./coach.validation";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

// Public — self-registration
router.post("/register", validate(createCoachSchema), coachController.register);

// Club admin registers a coach
router.post(
  "/register/by-admin",
  authenticate,
  authorize("coach:create"),
  validate(createCoachSchema),
  coachController.registerByClubAdmin
);

// Coach sees own profile
router.get("/profile", authenticate, coachController.getProfile);

// Admin routes
router.get("/",               authenticate, authorize("coach:view"),   coachController.findAll);
router.get("/status/:status", authenticate, authorize("coach:view"),   coachController.findByStatus);
router.get("/club/:clubId",   authenticate, authorize("coach:view"),   coachController.findByClub);
router.get("/:id",            authenticate, authorize("coach:view"),   coachController.getById);
router.delete("/:id",         authenticate, authorize("coach:delete"), coachController.delete);

export default router;

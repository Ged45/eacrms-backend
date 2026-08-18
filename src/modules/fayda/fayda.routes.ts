import { Router } from "express";
import { faydaController } from "./fayda.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { initiateVerificationSchema, confirmOtpSchema } from "./fayda.validation";

const router = Router();

// Stateless self-registration flow (mobile/web before athlete exists)
router.post(
  "/fayda/initiate",
  validate(initiateVerificationSchema),
  faydaController.initiateStateless
);

router.post(
  "/fayda/verify/confirm",
  validate(confirmOtpSchema),
  faydaController.confirmStatelessOtp
);

// Athlete fayda routes (nested under /athletes/:athleteId/fayda)
router.post(
  "/athletes/:athleteId/fayda/initiate",
  authenticate,
  authorize("fayda:verify"),
  validate(initiateVerificationSchema),
  faydaController.initiateForAthlete
);

router.get(
  "/athletes/:athleteId/fayda/status",
  authenticate,
  authorize("fayda:verify"),
  faydaController.getAthleteStatus
);

// Coach fayda routes
router.post(
  "/coaches/:coachId/fayda/initiate",
  authenticate,
  authorize("fayda:verify"),
  validate(initiateVerificationSchema),
  faydaController.initiateForCoach
);

router.get(
  "/coaches/:coachId/fayda/status",
  authenticate,
  authorize("fayda:verify"),
  faydaController.getCoachStatus
);

// OTP confirmation (shared — works for both athlete and coach)
router.post(
  "/fayda/verify/:verificationId/confirm",
  authenticate,
  validate(confirmOtpSchema),
  faydaController.confirmOtp
);

export default router;

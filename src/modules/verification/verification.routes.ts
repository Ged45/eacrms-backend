import { Router } from "express";
import { verificationController } from "./verification.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import {
  verifyEmailSchema,
  verifyPhoneSchema,
  phoneVerificationSchema,
  resendSchema,
} from "./verification.validation";

const router = Router();

// Public — no token needed (user just registered and doesn't have a token yet)
router.post("/email",  validate(verifyEmailSchema), verificationController.verifyEmail);
router.post("/phone/public", validate(phoneVerificationSchema), verificationController.verifyPhoneByNumber);

// Authenticated — user must be logged in (or use userId from registration response)
// Note: these require a token, but the user isn't ACTIVE yet.
// We allow PENDING users to hit these endpoints since authenticate only checks token validity.
router.post("/phone/request", authenticate, verificationController.requestPhoneOtp);
router.post("/phone",         authenticate, validate(verifyPhoneSchema), verificationController.verifyPhone);
router.post("/resend",        authenticate, validate(resendSchema),      verificationController.resend);
router.get( "/status",        authenticate, verificationController.getStatus);

export default router;

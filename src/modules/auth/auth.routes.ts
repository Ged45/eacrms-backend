import { Router } from "express";

import { authController } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

const router = Router();

router.post(
  "/register",
 

  authController.register
);

router.post(
  "/login",
  
  authController.login
);

router.post(
  "/refresh",
  
  authController.refresh
);

router.post(
  "/logout",
  
  authController.logout
);

router.get(
  "/me",
  authenticate,
  authController.me
);

router.post(
  "/forgot-password",
  authController.forgotPassword
);

router.post(
  "/reset-password",
  authController.resetPassword
);

export default router;
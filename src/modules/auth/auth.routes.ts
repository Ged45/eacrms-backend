import { Router } from "express";

import { authController } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/register",
  authenticate,
  authController.register
);

router.post(
  "/login",
  authenticate,
  authController.login
);

router.post(
  "/refresh",
  authenticate,
  authController.refresh
);

router.post(
  "/logout",
  authenticate,
  authController.logout
);

router.get(
  "/me",
  authenticate,
  authController.me
);

export default router;
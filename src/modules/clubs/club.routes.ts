import { Router } from "express";

import { clubController } from "./club.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { validate } from "../../middleware/validate.middleware";
import { publicLimiter } from "../../middleware/rateLimit.middleware";

import {
  registerClubSchema,
  registerClubAdminSchema,
  rejectClubSchema,
} from "./club.validation";

const router = Router();

/**
 * ------------------------------------------------
 * Public Routes (no auth required)
 * ------------------------------------------------
 */
router.get(
  "/verified",
  publicLimiter,
  clubController.findVerified
);

router.get(
  "/public/:id",
  publicLimiter,
  clubController.findPublicById
);

/**
 * ------------------------------------------------
 * Club Registration
 * ------------------------------------------------
 */
router.post(
  "/register",
  validate(registerClubSchema),
  clubController.register
);

/**
 * ------------------------------------------------
 * Club Admin Registration (creates User + Club)
 * ------------------------------------------------
 */
router.post(
  "/register-admin",
  validate(registerClubAdminSchema),
  clubController.registerAdmin
);

/**
 * ------------------------------------------------
 * Get Clubs (Authenticated)
 * ------------------------------------------------
 */
router.get(
  "/",
  authenticate,
  authorize("club:view"),
  clubController.findAll
);

/**
 * ------------------------------------------------
 * Federation Admin Only
 * ------------------------------------------------
 */
router.get(
  "/pending",
  authenticate,
  requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"),
  authorize("club:approve"),
  clubController.findPending
);

router.get(
  "/:id",
  authenticate,
  authorize("club:view"),
  clubController.findById
);

router.patch(
  "/:id/approve",
  authenticate,
  requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"),
  authorize("club:approve"),
  clubController.approve
);

router.patch(
  "/:id/reject",
  authenticate,
  requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"),
  authorize("club:approve"),
  validate(rejectClubSchema),
  clubController.reject
);

router.patch(
  "/:id/suspend",
  authenticate,
  requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"),
  authorize("club:approve"),
  clubController.suspend
);

router.delete(
  "/:id",
  authenticate,
  requireRole("SUPER_ADMIN", "FEDERATION_ADMIN"),
  authorize("club:delete"),
  clubController.delete
);

export default router;
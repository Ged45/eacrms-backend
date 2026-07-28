import { Router } from "express";

import { clubController } from "./club.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  registerClubSchema,
  rejectClubSchema,
} from "./club.validation";

const router = Router();

/**
 * ------------------------------------------------
 * Public / Club Admin Registration
 * ------------------------------------------------
 */
router.post(
  "/register",
  validate(registerClubSchema),
  clubController.register
);

/**
 * ------------------------------------------------
 * Get Clubs
 * ------------------------------------------------
 */
router.get(
  "/",
  authenticate,
  clubController.findAll
);

router.get(
  "/verified",
  authenticate,
  clubController.findVerified
);

/**
 * ------------------------------------------------
 * Federation Admin Only
 * ------------------------------------------------
 */
router.get(
  "/pending",
  authenticate,
  authorize("club:approve"),
  clubController.findPending
);

router.get(
  "/:id",
  authenticate,
  clubController.findById
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("club:approve"),
  clubController.approve
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("club:approve"),
  validate(rejectClubSchema),
  clubController.reject
);

router.patch(
  "/:id/suspend",
  authenticate,
  authorize("club:approve"),
  clubController.suspend
);

router.delete(
  "/:id",
  authenticate,
  authorize("club:delete"),
  clubController.delete
);

export default router;
import { Router } from "express";

import { athleteController } from "./athlete.controller";

import { validate } from "../../middleware/validate.middleware";

import { createAthleteSchema, createAthleteByAdminSchema } from "./athlete.validation";

import { authenticate } from "../../middleware/auth.middleware";

import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Club admin registers an athlete
router.post(
    "/register/by-admin",
    authenticate,
    authorize("athlete:create"),
    validate(createAthleteByAdminSchema),
    athleteController.registerByClubAdmin
);

router.post(
    "/register",
    validate(createAthleteSchema),
    athleteController.register
);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/profile",
    authenticate,
    athleteController.getProfile
);

router.get(
    "/profile/fayda",
    authenticate,
    athleteController.getFaydaForProfile
);

/*
|--------------------------------------------------------------------------
| Administrator Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    authenticate,
    authorize("athlete:view"),
    athleteController.findAll
);

router.get(
    "/search",
    authenticate,
    authorize("athlete:view"),
    athleteController.search
);

router.get(
    "/status/:status",
    authenticate,
    authorize("athlete:view"),
    athleteController.findByStatus
);

router.patch(
    "/:id/approve",
    authenticate,
    authorize("athlete:update"),
    athleteController.approve
);

router.patch(
    "/:id/reject",
    authenticate,
    authorize("athlete:update"),
    athleteController.reject
);

router.patch(
    "/:id/activate",
    authenticate,
    authorize("athlete:update"),
    athleteController.activate
);

router.patch(
    "/:id/suspend",
    authenticate,
    authorize("athlete:update"),
    athleteController.suspend
);

router.get(
    "/:id",
    authenticate,
    authorize("athlete:view"),
    athleteController.getById
);

router.delete(
    "/:id",
    authenticate,
    authorize("athlete:delete"),
    athleteController.delete
);

export default router;
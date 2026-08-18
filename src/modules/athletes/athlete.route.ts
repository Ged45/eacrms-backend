import { Router } from "express";

import { athleteController } from "./athlete.controller";

import { validate } from "../../middleware/validate.middleware";

import { createAthleteSchema, createAthleteByAdminSchema, updateProfileSchema, createPersonalBestSchema, createTrainingLogSchema, createWeightLogSchema } from "./athlete.validation";

import { authenticate } from "../../middleware/auth.middleware";

import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Public fan-facing athlete list (no auth required)
router.get(
    "/public",
    athleteController.getPublicList
);

// Public fan-facing athlete detail (no auth required)
// NOTE: This route must be defined BEFORE /:id to avoid conflicts
router.get(
    "/public/:id",
    athleteController.getPublicById
);

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

router.patch(
    "/profile",
    authenticate,
    validate(updateProfileSchema),
    athleteController.updateProfile
);

router.get(
    "/profile/fayda",
    authenticate,
    athleteController.getFaydaForProfile
);

router.get(
    "/profile/personal-bests",
    authenticate,
    athleteController.getPersonalBests
);

router.post(
    "/profile/personal-bests",
    authenticate,
    validate(createPersonalBestSchema),
    athleteController.createPersonalBest
);

router.get(
    "/profile/training-logs",
    authenticate,
    athleteController.getTrainingLogs
);

router.post(
    "/profile/training-logs",
    authenticate,
    validate(createTrainingLogSchema),
    athleteController.createTrainingLog
);

router.get(
    "/profile/weight-logs",
    authenticate,
    athleteController.getWeightLogs
);

router.post(
    "/profile/weight-logs",
    authenticate,
    validate(createWeightLogSchema),
    athleteController.createWeightLog
);

router.get(
    "/applications",
    authenticate,
    athleteController.getApplications
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
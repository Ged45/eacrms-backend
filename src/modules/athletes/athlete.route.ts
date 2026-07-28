import { Router } from "express";

import { athleteController } from "./athlete.controller";

import { validate } from "../../middleware/validate.middleware";

import { createAthleteSchema } from "./athlete.validation";

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
    validate(createAthleteSchema),
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